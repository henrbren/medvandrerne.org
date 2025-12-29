import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleActivityNotification, cancelActivityNotification, cleanupNotifications } from '../services/notifications';
import { useAppData } from '../contexts/AppDataContext';
import { API_BASE_URL } from '../services/api';

const STORAGE_KEY = '@medvandrerne_registrations';
const USER_ID_KEY = '@medvandrerne_user_id';
const REGISTRATION_COUNTS_KEY = '@medvandrerne_registration_counts';

// Generate or get persistent user ID
const getUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous_' + Date.now();
  }
};

export const useRegistrations = () => {
  const { data } = useAppData();
  const SAMPLE_ACTIVITIES = data.activities || [];
  const [registrations, setRegistrations] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Initialize user ID
  useEffect(() => {
    const initUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    initUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadRegistrations();
      fetchAllRegistrationCounts();
    }
  }, [SAMPLE_ACTIVITIES, userId]);

  // Fetch all registration counts from backend
  const fetchAllRegistrationCounts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/get.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.registrationCounts) {
          setRegistrationCounts(result.registrationCounts);
          // Cache locally
          await AsyncStorage.setItem(REGISTRATION_COUNTS_KEY, JSON.stringify(result.registrationCounts));
        }
      }
    } catch (error) {
      console.error('Error fetching registration counts:', error);
      // Try to load from cache
      try {
        const cached = await AsyncStorage.getItem(REGISTRATION_COUNTS_KEY);
        if (cached) {
          setRegistrationCounts(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.error('Error loading cached counts:', cacheError);
      }
    }
  }, []);

  // Fetch registration data for a specific activity
  const fetchRegistrationData = useCallback(async (activityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/get.php?activityId=${activityId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRegistrationCounts(prev => ({
            ...prev,
            [activityId]: result.registrationCount,
          }));
          return result;
        }
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
    }
    return null;
  }, []);

  const loadRegistrations = async () => {
    try {
      // Clean up old and duplicate notifications first
      await cleanupNotifications();
      
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedRegistrations = JSON.parse(stored);
        setRegistrations(loadedRegistrations);
        
        // Sync notifications for loaded registrations - only schedule if not already scheduled
        if (loadedRegistrations.length > 0 && Platform.OS !== 'web') {
          // Get existing notifications to check for duplicates
          const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
          const existingActivityIds = new Set(
            existingNotifications
              .filter(n => n.content.data?.activityId)
              .map(n => n.content.data.activityId)
          );

          for (const activityId of loadedRegistrations) {
            // Only schedule if not already scheduled
            if (!existingActivityIds.has(activityId)) {
              const activity = SAMPLE_ACTIVITIES.find(a => a.id === activityId);
              if (activity) {
                await scheduleActivityNotification(activity);
              }
            }
          }
        }
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRegistrations = async (newRegistrations) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRegistrations));
      setRegistrations(newRegistrations);
    } catch (error) {
      console.error('Error saving registrations:', error);
    }
  };

  const registerForActivity = async (activity) => {
    if (!activity || !activity.id) return { success: false };
    
    const activityId = String(activity.id);
    const newRegistrations = [...registrations, activityId];
    await saveRegistrations(newRegistrations);
    
    // Schedule notification for the activity
    const fullActivity = SAMPLE_ACTIVITIES.find(a => String(a.id) === activityId) || activity;
    await scheduleActivityNotification(fullActivity);
    
    // Sync with backend
    try {
      const userName = await AsyncStorage.getItem('@medvandrerne_user_name') || 'Medvandrer';
      const response = await fetch(`${API_BASE_URL}/registrations/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          activityId: activityId,
          userId: userId,
          userName: userName,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRegistrationCounts(prev => ({
            ...prev,
            [activityId]: result.registrationCount,
          }));
          return result;
        }
      }
    } catch (error) {
      console.error('Error syncing registration with backend:', error);
      // Registration is saved locally, will sync later
    }
    
    return { success: true };
  };

  const unregisterFromActivity = async (activityId) => {
    const stringId = String(activityId);
    const newRegistrations = registrations.filter(id => String(id) !== stringId);
    await saveRegistrations(newRegistrations);
    
    // Cancel notification for the activity
    await cancelActivityNotification(activityId);
    
    // Sync with backend
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/unregister.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          activityId: stringId,
          userId: userId,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRegistrationCounts(prev => ({
            ...prev,
            [stringId]: result.registrationCount,
          }));
          return result;
        }
      }
    } catch (error) {
      console.error('Error syncing unregistration with backend:', error);
    }
    
    return { success: true };
  };

  const isRegistered = useCallback((activityId) => {
    return registrations.includes(String(activityId)) || registrations.includes(activityId);
  }, [registrations]);

  const getRegistrationCount = useCallback((activityId) => {
    return registrationCounts[String(activityId)] || 0;
  }, [registrationCounts]);

  return {
    registrations,
    registrationCounts,
    loading,
    registerForActivity,
    unregisterFromActivity,
    isRegistered,
    getRegistrationCount,
    loadRegistrations,
    fetchRegistrationData,
    fetchAllRegistrationCounts,
  };
};


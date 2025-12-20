import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleActivityNotification, cancelActivityNotification, cleanupNotifications } from '../services/notifications';
import { useAppData } from '../contexts/AppDataContext';

const STORAGE_KEY = '@medvandrerne_registrations';

export const useRegistrations = () => {
  const { data } = useAppData();
  const SAMPLE_ACTIVITIES = data.activities || [];
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, [SAMPLE_ACTIVITIES]);

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
    if (!activity || !activity.id) return;
    const newRegistrations = [...registrations, activity.id];
    await saveRegistrations(newRegistrations);
    
    // Schedule notification for the activity
    const fullActivity = SAMPLE_ACTIVITIES.find(a => a.id === activity.id) || activity;
    await scheduleActivityNotification(fullActivity);
  };

  const unregisterFromActivity = async (activityId) => {
    const newRegistrations = registrations.filter(id => id !== activityId);
    await saveRegistrations(newRegistrations);
    
    // Cancel notification for the activity
    await cancelActivityNotification(activityId);
  };

  const isRegistered = (activityId) => {
    return registrations.includes(activityId);
  };

  return {
    registrations,
    loading,
    registerForActivity,
    unregisterFromActivity,
    isRegistered,
    loadRegistrations,
  };
};


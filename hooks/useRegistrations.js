import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleActivityNotification, cancelActivityNotification } from '../services/notifications';
import { SAMPLE_ACTIVITIES } from '../constants/data';

const STORAGE_KEY = '@medvandrerne_registrations';

export const useRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedRegistrations = JSON.parse(stored);
        setRegistrations(loadedRegistrations);
        
        // Sync notifications for loaded registrations
        if (loadedRegistrations.length > 0) {
          for (const activityId of loadedRegistrations) {
            const activity = SAMPLE_ACTIVITIES.find(a => a.id === activityId);
            if (activity) {
              await scheduleActivityNotification(activity);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
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


import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistrations } from './useRegistrations';

const STATS_STORAGE_KEY = '@medvandrerne_activity_stats';
const COMPLETED_ACTIVITIES_KEY = '@medvandrerne_completed_activities';

export const useActivityStats = () => {
  const { registrations } = useRegistrations();
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalCompletedActivities: 0,
    totalRegistrations: 0,
    totalHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    activitiesThisMonth: 0,
    activitiesThisYear: 0,
    firstActivityDate: null,
    lastActivityDate: null,
  });
  const [completedActivities, setCompletedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadCompletedActivities();
  }, [registrations]);

  const loadCompletedActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem(COMPLETED_ACTIVITIES_KEY);
      if (stored) {
        setCompletedActivities(JSON.parse(stored));
      } else {
        setCompletedActivities([]);
      }
    } catch (error) {
      console.error('Error loading completed activities:', error);
      setCompletedActivities([]);
    }
  };

  const loadStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        setStats(parsedStats);
      } else {
        // Explicitly reset to default when no data exists
        setStats({
          totalActivities: 0,
          totalHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          activitiesThisMonth: 0,
          activitiesThisYear: 0,
          firstActivityDate: null,
          lastActivityDate: null,
        });
      }
      calculateStats();
    } catch (error) {
      console.error('Error loading activity stats:', error);
      setStats({
        totalActivities: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        activitiesThisMonth: 0,
        activitiesThisYear: 0,
        firstActivityDate: null,
        lastActivityDate: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      const storedStats = storedData ? JSON.parse(storedData) : {
        totalActivities: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        activitiesThisMonth: 0,
        activitiesThisYear: 0,
        firstActivityDate: null,
        lastActivityDate: null,
        activityDates: [],
      };

      // Load completed activities
      const storedCompleted = await AsyncStorage.getItem(COMPLETED_ACTIVITIES_KEY);
      const completed = storedCompleted ? JSON.parse(storedCompleted) : [];

      // Update with current registrations and completed activities
      const newStats = {
        ...storedStats,
        totalRegistrations: registrations.length,
        totalCompletedActivities: completed.length,
        totalActivities: completed.length, // For backwards compatibility, use completed as total
        activityDates: storedStats.activityDates || [],
      };

      // Calculate streaks
      if (newStats.activityDates.length > 0 && registrations.length > 0) {
        const sortedDates = [...newStats.activityDates].sort((a, b) => 
          new Date(b) - new Date(a)
        );
        
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedDates.length; i++) {
          const date = new Date(sortedDates[i]);
          date.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === i) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Calculate longest streak
        let longestStreak = 1;
        let tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const daysDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }

        newStats.currentStreak = currentStreak;
        newStats.longestStreak = longestStreak;
        newStats.lastActivityDate = sortedDates[0];
        newStats.firstActivityDate = sortedDates[sortedDates.length - 1];
      } else {
        // Reset streaks when no activities
        newStats.currentStreak = 0;
        newStats.longestStreak = 0;
        newStats.lastActivityDate = null;
        newStats.firstActivityDate = null;
        newStats.activityDates = [];
      }

      // Calculate monthly and yearly stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      newStats.activitiesThisMonth = newStats.activityDates.filter(date => {
        const d = new Date(date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;

      newStats.activitiesThisYear = newStats.activityDates.filter(date => {
        const d = new Date(date);
        return d.getFullYear() === thisYear;
      }).length;

      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const recordActivity = async (activityDate, hours = 2) => {
    try {
      const storedData = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      const storedStats = storedData ? JSON.parse(storedData) : {
        activityDates: [],
        totalHours: 0,
      };

      const dateString = new Date(activityDate).toISOString().split('T')[0];
      
      if (!storedStats.activityDates.includes(dateString)) {
        storedStats.activityDates.push(dateString);
        storedStats.totalHours = (storedStats.totalHours || 0) + hours;
        
        await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(storedStats));
        await calculateStats();
      }
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  const completeActivity = async (activityId) => {
    try {
      const stored = await AsyncStorage.getItem(COMPLETED_ACTIVITIES_KEY);
      const completed = stored ? JSON.parse(stored) : [];
      
      if (!completed.includes(activityId)) {
        const updated = [...completed, activityId];
        await AsyncStorage.setItem(COMPLETED_ACTIVITIES_KEY, JSON.stringify(updated));
        setCompletedActivities(updated);
        
        // Record activity date for streak calculation
        await recordActivity(new Date());
        await calculateStats();
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const uncompleteActivity = async (activityId) => {
    try {
      const stored = await AsyncStorage.getItem(COMPLETED_ACTIVITIES_KEY);
      const completed = stored ? JSON.parse(stored) : [];
      
      const updated = completed.filter(id => id !== activityId);
      await AsyncStorage.setItem(COMPLETED_ACTIVITIES_KEY, JSON.stringify(updated));
      setCompletedActivities(updated);
      await calculateStats();
    } catch (error) {
      console.error('Error uncompleting activity:', error);
    }
  };

  const isActivityCompleted = (activityId) => {
    return completedActivities.includes(activityId);
  };

  return {
    stats,
    loading,
    recordActivity,
    calculateStats,
    completeActivity,
    uncompleteActivity,
    isActivityCompleted,
    completedActivities,
  };
};



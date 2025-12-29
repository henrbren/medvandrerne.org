import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PEDOMETER_STORAGE_KEY = '@medvandrerne_pedometer';
const PEDOMETER_HISTORY_KEY = '@medvandrerne_pedometer_history';

// XP Configuration
const STEPS_PER_XP = 100; // 1 XP per 100 steps
const MAX_XP_PER_DAY = 500; // Maximum 500 XP per day from steps (50,000 steps)
const MAX_STEPS_PER_HOUR = 15000; // Max realistic steps per hour (about 250 steps/min)
const MAX_STEPS_JUMP = 5000; // Max steps that can be added at once without suspicion
const MIN_TIME_BETWEEN_UPDATES_MS = 30000; // Minimum 30 seconds between XP updates

// Anti-cheat: Unrealistic step rates
const UNREALISTIC_STEPS_PER_SECOND = 5; // More than 5 steps per second is suspicious (300 steps/min)

export const usePedometer = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [todaySteps, setTodaySteps] = useState(0);
  const [xpEarnedToday, setXpEarnedToday] = useState(0);
  const [totalStepsAllTime, setTotalStepsAllTime] = useState(0);
  const [totalXPFromSteps, setTotalXPFromSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pendingXP, setPendingXP] = useState(0);
  
  const subscriptionRef = useRef(null);
  const lastStepCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const dailyHistoryRef = useRef([]);

  // Get today's date string for comparison
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  // Load stored data
  const loadData = useCallback(async () => {
    try {
      const [storedData, historyData] = await Promise.all([
        AsyncStorage.getItem(PEDOMETER_STORAGE_KEY),
        AsyncStorage.getItem(PEDOMETER_HISTORY_KEY),
      ]);

      const today = getTodayString();
      
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Check if it's a new day
        if (data.date === today) {
          setTodaySteps(data.todaySteps || 0);
          setXpEarnedToday(data.xpEarnedToday || 0);
          lastStepCountRef.current = data.lastStepCount || 0;
          lastUpdateTimeRef.current = data.lastUpdateTime || Date.now();
        } else {
          // New day - reset daily counters
          setTodaySteps(0);
          setXpEarnedToday(0);
          lastStepCountRef.current = 0;
        }
        
        setTotalStepsAllTime(data.totalStepsAllTime || 0);
        setTotalXPFromSteps(data.totalXPFromSteps || 0);
        setLastUpdate(data.lastUpdate || null);
      }

      if (historyData) {
        dailyHistoryRef.current = JSON.parse(historyData);
        // Keep only last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        dailyHistoryRef.current = dailyHistoryRef.current.filter(
          entry => entry.timestamp > thirtyDaysAgo
        );
      }
    } catch (error) {
      console.error('Error loading pedometer data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to storage
  const saveData = useCallback(async (newData) => {
    try {
      const today = getTodayString();
      const dataToSave = {
        date: today,
        todaySteps: newData.todaySteps ?? todaySteps,
        xpEarnedToday: newData.xpEarnedToday ?? xpEarnedToday,
        totalStepsAllTime: newData.totalStepsAllTime ?? totalStepsAllTime,
        totalXPFromSteps: newData.totalXPFromSteps ?? totalXPFromSteps,
        lastStepCount: lastStepCountRef.current,
        lastUpdateTime: lastUpdateTimeRef.current,
        lastUpdate: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(PEDOMETER_STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Save history
      await AsyncStorage.setItem(PEDOMETER_HISTORY_KEY, JSON.stringify(dailyHistoryRef.current));
    } catch (error) {
      console.error('Error saving pedometer data:', error);
    }
  }, [todaySteps, xpEarnedToday, totalStepsAllTime, totalXPFromSteps]);

  // Anti-cheat: Validate step count
  const validateStepCount = useCallback((newSteps, timeDeltaMs) => {
    // Check 1: Negative steps (impossible)
    if (newSteps < 0) {
      console.warn('Pedometer: Negative step count detected, rejecting');
      return { valid: false, reason: 'negative_steps' };
    }

    // Check 2: Too many steps at once (sudden jump)
    if (newSteps > MAX_STEPS_JUMP) {
      console.warn(`Pedometer: Sudden jump of ${newSteps} steps detected, capping`);
      return { valid: true, adjustedSteps: MAX_STEPS_JUMP, reason: 'capped_jump' };
    }

    // Check 3: Unrealistic step rate
    if (timeDeltaMs > 0) {
      const stepsPerSecond = newSteps / (timeDeltaMs / 1000);
      if (stepsPerSecond > UNREALISTIC_STEPS_PER_SECOND) {
        console.warn(`Pedometer: Unrealistic rate of ${stepsPerSecond.toFixed(2)} steps/sec detected`);
        // Cap to realistic rate
        const maxRealisticSteps = Math.floor((timeDeltaMs / 1000) * UNREALISTIC_STEPS_PER_SECOND);
        return { valid: true, adjustedSteps: Math.min(newSteps, maxRealisticSteps), reason: 'rate_limited' };
      }
    }

    // Check 4: Hourly limit
    const hourMs = 60 * 60 * 1000;
    const recentHistory = dailyHistoryRef.current.filter(
      entry => entry.timestamp > Date.now() - hourMs
    );
    const recentSteps = recentHistory.reduce((sum, entry) => sum + entry.steps, 0);
    
    if (recentSteps + newSteps > MAX_STEPS_PER_HOUR) {
      const allowedSteps = Math.max(0, MAX_STEPS_PER_HOUR - recentSteps);
      console.warn(`Pedometer: Hourly limit reached, allowing only ${allowedSteps} steps`);
      return { valid: true, adjustedSteps: allowedSteps, reason: 'hourly_limit' };
    }

    return { valid: true, adjustedSteps: newSteps, reason: 'ok' };
  }, []);

  // Process new steps and calculate XP
  const processSteps = useCallback((stepCount) => {
    const now = Date.now();
    const timeDelta = now - lastUpdateTimeRef.current;
    
    // Minimum time between updates
    if (timeDelta < MIN_TIME_BETWEEN_UPDATES_MS) {
      return;
    }

    const newSteps = stepCount - lastStepCountRef.current;
    
    if (newSteps <= 0) {
      lastStepCountRef.current = stepCount;
      return;
    }

    // Validate steps
    const validation = validateStepCount(newSteps, timeDelta);
    if (!validation.valid) {
      return;
    }

    const validatedSteps = validation.adjustedSteps;

    // Add to history for anti-cheat tracking
    dailyHistoryRef.current.push({
      timestamp: now,
      steps: validatedSteps,
      reason: validation.reason,
    });

    // Calculate new values
    const newTodaySteps = todaySteps + validatedSteps;
    const newTotalSteps = totalStepsAllTime + validatedSteps;
    
    // Calculate XP (with daily cap)
    const potentialXP = Math.floor(validatedSteps / STEPS_PER_XP);
    const remainingDailyXP = MAX_XP_PER_DAY - xpEarnedToday;
    const xpToAward = Math.min(potentialXP, remainingDailyXP);
    
    const newXpEarnedToday = xpEarnedToday + xpToAward;
    const newTotalXP = totalXPFromSteps + xpToAward;

    // Update state
    setTodaySteps(newTodaySteps);
    setXpEarnedToday(newXpEarnedToday);
    setTotalStepsAllTime(newTotalSteps);
    setTotalXPFromSteps(newTotalXP);
    setLastUpdate(new Date().toISOString());
    
    if (xpToAward > 0) {
      setPendingXP(prev => prev + xpToAward);
    }

    // Update refs
    lastStepCountRef.current = stepCount;
    lastUpdateTimeRef.current = now;

    // Save data
    saveData({
      todaySteps: newTodaySteps,
      xpEarnedToday: newXpEarnedToday,
      totalStepsAllTime: newTotalSteps,
      totalXPFromSteps: newTotalXP,
    });

    console.log(`Pedometer: Added ${validatedSteps} steps, awarded ${xpToAward} XP (${validation.reason})`);
  }, [todaySteps, xpEarnedToday, totalStepsAllTime, totalXPFromSteps, validateStepCount, saveData]);

  // Claim pending XP (called by gamification system)
  const claimPendingXP = useCallback(() => {
    const xp = pendingXP;
    setPendingXP(0);
    return xp;
  }, [pendingXP]);

  // Subscribe to pedometer updates
  const subscribe = useCallback(async () => {
    if (Platform.OS === 'web') {
      setIsPedometerAvailable('unavailable');
      return;
    }

    try {
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(available ? 'available' : 'unavailable');
      setIsAvailable(available);

      if (!available) {
        console.log('Pedometer is not available on this device');
        return;
      }

      // Get steps from the start of today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        if (result) {
          lastStepCountRef.current = result.steps;
          setTodaySteps(prev => Math.max(prev, result.steps));
        }
      } catch (e) {
        console.log('Could not get historical step count:', e);
      }

      // Subscribe to live updates
      subscriptionRef.current = Pedometer.watchStepCount(result => {
        processSteps(result.steps);
      });

      console.log('Pedometer subscription started');
    } catch (error) {
      console.error('Error setting up pedometer:', error);
      setIsPedometerAvailable('unavailable');
    }
  }, [processSteps]);

  // Unsubscribe from pedometer
  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log('Pedometer subscription removed');
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground - resubscribe
        subscribe();
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background - the subscription will continue
        // but we should be more careful about accepting large step jumps
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [subscribe]);

  // Initialize
  useEffect(() => {
    loadData().then(() => {
      subscribe();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Reset daily stats (called at midnight or manually for testing)
  const resetDailyStats = useCallback(async () => {
    setTodaySteps(0);
    setXpEarnedToday(0);
    lastStepCountRef.current = 0;
    dailyHistoryRef.current = [];
    await saveData({
      todaySteps: 0,
      xpEarnedToday: 0,
    });
  }, [saveData]);

  // Get stats for display
  const getStats = useCallback(() => {
    return {
      todaySteps,
      xpEarnedToday,
      remainingXPToday: MAX_XP_PER_DAY - xpEarnedToday,
      totalStepsAllTime,
      totalXPFromSteps,
      stepsToNextXP: STEPS_PER_XP - (todaySteps % STEPS_PER_XP),
      maxXPPerDay: MAX_XP_PER_DAY,
      stepsPerXP: STEPS_PER_XP,
    };
  }, [todaySteps, xpEarnedToday, totalStepsAllTime, totalXPFromSteps]);

  return {
    // State
    isAvailable,
    isPedometerAvailable,
    todaySteps,
    xpEarnedToday,
    totalStepsAllTime,
    totalXPFromSteps,
    pendingXP,
    loading,
    lastUpdate,
    
    // Actions
    claimPendingXP,
    resetDailyStats,
    getStats,
    
    // Constants for display
    STEPS_PER_XP,
    MAX_XP_PER_DAY,
  };
};

export default usePedometer;


/**
 * App Data Context
 * Provider for å dele API-data gjennom hele appen
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { fetchAllData, clearCache, invalidateDynamicCaches } from '../services/api';
import * as defaultData from '../constants/data';

const AppDataContext = createContext();

// How long before we consider data stale (in ms)
const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState({
    organization: defaultData.ORGANIZATION_INFO,
    mission: defaultData.MISSION,
    coreActivities: defaultData.CORE_ACTIVITIES,
    localGroups: defaultData.LOCAL_GROUPS,
    administration: defaultData.ADMINISTRATION,
    board: defaultData.BOARD,
    activities: defaultData.SAMPLE_ACTIVITIES,
    supporters: defaultData.SUPPORTERS,
    news: [],
    calendar: [],
    resources: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const appState = useRef(AppState.currentState);
  const lastBackgroundTime = useRef(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiData = await fetchAllData(forceRefresh);
      
      // Merge med default data for å sikre at alle felter er tilstede
      setData({
        organization: apiData.organization || defaultData.ORGANIZATION_INFO,
        mission: apiData.mission || defaultData.MISSION,
        coreActivities: apiData.coreActivities || defaultData.CORE_ACTIVITIES,
        localGroups: apiData.localGroups || defaultData.LOCAL_GROUPS,
        administration: apiData.administration || defaultData.ADMINISTRATION,
        board: apiData.board || defaultData.BOARD,
        activities: apiData.activities || defaultData.SAMPLE_ACTIVITIES,
        supporters: apiData.supporters || defaultData.SUPPORTERS,
        news: apiData.news || [],
        calendar: apiData.calendar || [],
        resources: apiData.resources || [],
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading app data:', err);
      setError(err.message);
      // Bruk default data hvis API feiler
      // Data er allerede satt til default verdier
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  const clearDataCache = useCallback(async () => {
    await clearCache();
    await loadData(true);
  }, [loadData]);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    if (!lastUpdated) return true;
    return (Date.now() - lastUpdated.getTime()) > STALE_THRESHOLD;
  }, [lastUpdated]);

  // Soft refresh - only if data is stale
  const softRefresh = useCallback(async () => {
    if (isDataStale()) {
      console.log('Data is stale, refreshing...');
      await invalidateDynamicCaches();
      await loadData(false); // Will fetch fresh due to invalidated cache
    }
  }, [isDataStale, loadData]);

  // Last data ved mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        lastBackgroundTime.current = Date.now();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to foreground
        if (lastBackgroundTime.current) {
          const timeInBackground = Date.now() - lastBackgroundTime.current;
          // If app was in background for more than 1 minute, refresh data
          if (timeInBackground > 60 * 1000) {
            console.log(`App was in background for ${Math.round(timeInBackground / 1000)}s, refreshing data...`);
            softRefresh();
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [softRefresh]);

  const value = {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    clearDataCache,
    reloadData: loadData,
    softRefresh,
    isDataStale,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};


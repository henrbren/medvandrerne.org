/**
 * App Data Context
 * Provider for å dele API-data gjennom hele appen
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllData, clearCache } from '../services/api';
import * as defaultData from '../constants/data';

const AppDataContext = createContext();

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

  // Last data ved mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const value = {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    clearDataCache,
    reloadData: loadData,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

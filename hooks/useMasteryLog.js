import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MASTERY_LOG_STORAGE_KEY = '@medvandrerne_mastery_log';
const MASTERY_MOMENTS_STORAGE_KEY = '@medvandrerne_mastery_moments';

export const useMasteryLog = () => {
  const [entries, setEntries] = useState([]);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, momentsData] = await Promise.all([
        AsyncStorage.getItem(MASTERY_LOG_STORAGE_KEY),
        AsyncStorage.getItem(MASTERY_MOMENTS_STORAGE_KEY),
      ]);

      if (entriesData) {
        setEntries(JSON.parse(entriesData));
      } else {
        setEntries([]);
      }
      if (momentsData) {
        setMoments(JSON.parse(momentsData));
      } else {
        setMoments([]);
      }
    } catch (error) {
      console.error('Error loading mastery log:', error);
      setEntries([]);
      setMoments([]);
    } finally {
      setLoading(false);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem(MASTERY_LOG_STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving mastery log entries:', error);
    }
  };

  const saveMoments = async (newMoments) => {
    try {
      await AsyncStorage.setItem(MASTERY_MOMENTS_STORAGE_KEY, JSON.stringify(newMoments));
      setMoments(newMoments);
    } catch (error) {
      console.error('Error saving mastery moments:', error);
    }
  };

  const addEntry = async (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };
    const newEntries = [newEntry, ...entries];
    await saveEntries(newEntries);
    return newEntry;
  };

  const addMoment = async (moment) => {
    const newMoment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...moment,
    };
    const newMoments = [newMoment, ...moments];
    await saveMoments(newMoments);
    return newMoment;
  };

  const deleteEntry = async (entryId) => {
    const newEntries = entries.filter(entry => entry.id !== entryId);
    await saveEntries(newEntries);
  };

  const deleteMoment = async (momentId) => {
    const newMoments = moments.filter(moment => moment.id !== momentId);
    await saveMoments(newMoments);
  };

  const getStats = () => {
    const totalEntries = entries.length;
    const totalMoments = moments.length;
    const thisWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length;

    const categories = {
      physical: moments.filter(m => m.category === 'physical').length,
      social: moments.filter(m => m.category === 'social').length,
      emotional: moments.filter(m => m.category === 'emotional').length,
    };

    return {
      totalEntries,
      totalMoments,
      thisWeekEntries,
      categories,
    };
  };

  return {
    entries,
    moments,
    loading,
    addEntry,
    addMoment,
    deleteEntry,
    deleteMoment,
    getStats,
    loadData,
  };
};



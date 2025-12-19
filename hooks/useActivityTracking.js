import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPEDITIONS_STORAGE_KEY = '@medvandrerne_expeditions';
const ENVIRONMENT_STORAGE_KEY = '@medvandrerne_environment_actions';

export const useActivityTracking = () => {
  const [expeditions, setExpeditions] = useState([]);
  const [environmentActions, setEnvironmentActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expeditionsData, envData] = await Promise.all([
        AsyncStorage.getItem(EXPEDITIONS_STORAGE_KEY),
        AsyncStorage.getItem(ENVIRONMENT_STORAGE_KEY),
      ]);

      if (expeditionsData) {
        setExpeditions(JSON.parse(expeditionsData));
      } else {
        setExpeditions([]);
      }
      if (envData) {
        setEnvironmentActions(JSON.parse(envData));
      } else {
        setEnvironmentActions([]);
      }
    } catch (error) {
      console.error('Error loading activity tracking:', error);
      setExpeditions([]);
      setEnvironmentActions([]);
    } finally {
      setLoading(false);
    }
  };

  const saveExpeditions = async (newExpeditions) => {
    try {
      await AsyncStorage.setItem(EXPEDITIONS_STORAGE_KEY, JSON.stringify(newExpeditions));
      setExpeditions(newExpeditions);
    } catch (error) {
      console.error('Error saving expeditions:', error);
    }
  };

  const saveEnvironmentActions = async (newActions) => {
    try {
      await AsyncStorage.setItem(ENVIRONMENT_STORAGE_KEY, JSON.stringify(newActions));
      setEnvironmentActions(newActions);
    } catch (error) {
      console.error('Error saving environment actions:', error);
    }
  };

  const addExpedition = async (expedition) => {
    const newExpedition = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...expedition,
    };
    const newExpeditions = [newExpedition, ...expeditions];
    await saveExpeditions(newExpeditions);
    return newExpedition;
  };

  const addEnvironmentAction = async (action) => {
    const newAction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...action,
    };
    const newActions = [newAction, ...environmentActions];
    await saveEnvironmentActions(newActions);
    return newAction;
  };

  const deleteExpedition = async (expeditionId) => {
    const newExpeditions = expeditions.filter(exp => exp.id !== expeditionId);
    await saveExpeditions(newExpeditions);
  };

  const deleteEnvironmentAction = async (actionId) => {
    const newActions = environmentActions.filter(action => action.id !== actionId);
    await saveEnvironmentActions(newActions);
  };

  const getStats = () => {
    const totalExpeditions = expeditions.length;
    const totalEnvironmentActions = environmentActions.length;
    const thisYearExpeditions = expeditions.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === new Date().getFullYear();
    }).length;
    const thisYearEnvActions = environmentActions.filter(action => {
      const actionDate = new Date(action.date);
      return actionDate.getFullYear() === new Date().getFullYear();
    }).length;

    return {
      totalExpeditions,
      totalEnvironmentActions,
      thisYearExpeditions,
      thisYearEnvActions,
    };
  };

  return {
    expeditions,
    environmentActions,
    loading,
    addExpedition,
    addEnvironmentAction,
    deleteExpedition,
    deleteEnvironmentAction,
    getStats,
    loadData,
  };
};



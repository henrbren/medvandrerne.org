import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_STORAGE_KEY = '@medvandrerne_favorite_contacts';
const GROUPS_STORAGE_KEY = '@medvandrerne_favorite_groups';

export const useFavorites = () => {
  const [favoriteContacts, setFavoriteContacts] = useState([]);
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [contactsData, groupsData] = await Promise.all([
        AsyncStorage.getItem(CONTACTS_STORAGE_KEY),
        AsyncStorage.getItem(GROUPS_STORAGE_KEY),
      ]);

      if (contactsData) {
        setFavoriteContacts(JSON.parse(contactsData));
      }
      if (groupsData) {
        setFavoriteGroups(JSON.parse(groupsData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavoriteContacts = async (contacts) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      setFavoriteContacts(contacts);
    } catch (error) {
      console.error('Error saving favorite contacts:', error);
    }
  };

  const saveFavoriteGroups = async (groups) => {
    try {
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
      setFavoriteGroups(groups);
    } catch (error) {
      console.error('Error saving favorite groups:', error);
    }
  };

  const addFavoriteContact = async (contactId) => {
    if (!contactId || favoriteContacts.includes(contactId)) return;
    const newContacts = [...favoriteContacts, contactId];
    await saveFavoriteContacts(newContacts);
  };

  const removeFavoriteContact = async (contactId) => {
    const newContacts = favoriteContacts.filter(id => id !== contactId);
    await saveFavoriteContacts(newContacts);
  };

  const isContactFavorite = (contactId) => {
    return favoriteContacts.includes(contactId);
  };

  const addFavoriteGroup = async (groupId) => {
    if (!groupId || favoriteGroups.includes(groupId)) return;
    const newGroups = [...favoriteGroups, groupId];
    await saveFavoriteGroups(newGroups);
  };

  const removeFavoriteGroup = async (groupId) => {
    const newGroups = favoriteGroups.filter(id => id !== groupId);
    await saveFavoriteGroups(newGroups);
  };

  const isGroupFavorite = (groupId) => {
    return favoriteGroups.includes(groupId);
  };

  return {
    favoriteContacts,
    favoriteGroups,
    loading,
    addFavoriteContact,
    removeFavoriteContact,
    isContactFavorite,
    addFavoriteGroup,
    removeFavoriteGroup,
    isGroupFavorite,
    loadFavorites,
  };
};



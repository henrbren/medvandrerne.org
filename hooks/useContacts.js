import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_STORAGE_KEY = '@medvandrerne_contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const addContact = useCallback(async (contact) => {
    // Check if contact already exists
    const exists = contacts.find(c => c.id === contact.id);
    if (exists) {
      // Update existing contact
      const updated = contacts.map(c => 
        c.id === contact.id ? { ...c, ...contact, updatedAt: new Date().toISOString() } : c
      );
      await saveContacts(updated);
      return { success: true, isUpdate: true };
    }

    // Add new contact
    const newContact = {
      ...contact,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [newContact, ...contacts];
    await saveContacts(updated);
    return { success: true, isUpdate: false };
  }, [contacts]);

  const removeContact = useCallback(async (contactId) => {
    const updated = contacts.filter(c => c.id !== contactId);
    await saveContacts(updated);
    return { success: true };
  }, [contacts]);

  const getContact = useCallback((contactId) => {
    return contacts.find(c => c.id === contactId) || null;
  }, [contacts]);

  const hasContact = useCallback((contactId) => {
    return contacts.some(c => c.id === contactId);
  }, [contacts]);

  return {
    contacts,
    loading,
    addContact,
    removeContact,
    getContact,
    hasContact,
    loadContacts,
  };
};

export default useContacts;

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_STORAGE_KEY = '@medvandrerne_contacts';
const API_BASE_URL = 'https://henrikb30.sg-host.com/api';

// Contact types
export const CONTACT_TYPE = {
  SCANNED: 'scanned',      // Added via QR code scan
  FAVORITE: 'favorite',     // Added as favorite coordinator
  MANUAL: 'manual',         // Manually added
};

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = useCallback(async () => {
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
  }, []);

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(newContacts));
      setContacts(newContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  // Add contact from QR code scan
  const addContact = useCallback(async (contact) => {
    // Check if contact already exists
    const exists = contacts.find(c => c.id === contact.id);
    if (exists) {
      // Update existing contact
      const updated = contacts.map(c => 
        c.id === contact.id ? { 
          ...c, 
          ...contact, 
          updatedAt: new Date().toISOString(),
          // Keep the original type if it was a favorite
          contactType: c.contactType === CONTACT_TYPE.FAVORITE ? CONTACT_TYPE.FAVORITE : (contact.contactType || CONTACT_TYPE.SCANNED),
        } : c
      );
      await saveContacts(updated);
      return { success: true, isUpdate: true };
    }

    // Add new contact
    const newContact = {
      ...contact,
      contactType: contact.contactType || CONTACT_TYPE.SCANNED,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [newContact, ...contacts];
    await saveContacts(updated);
    return { success: true, isUpdate: false };
  }, [contacts]);

  // Add coordinator as favorite contact
  const addFavoriteCoordinator = useCallback(async (coordinator, groupInfo) => {
    // Check if already exists
    const existingContact = contacts.find(c => 
      c.phone === coordinator.phone || 
      c.email === coordinator.email ||
      (c.coordinatorId && c.coordinatorId === coordinator.id)
    );

    if (existingContact) {
      // Update existing contact with coordinator info
      const updated = contacts.map(c => 
        c.id === existingContact.id ? {
          ...c,
          ...coordinator,
          id: existingContact.id, // Keep original ID
          coordinatorId: coordinator.id,
          groupName: groupInfo?.name,
          groupId: groupInfo?.id,
          contactType: CONTACT_TYPE.FAVORITE,
          isFavorite: true,
          updatedAt: new Date().toISOString(),
        } : c
      );
      await saveContacts(updated);
      return { success: true, isUpdate: true, contact: updated.find(c => c.id === existingContact.id) };
    }

    // Create new contact from coordinator
    const newContact = {
      id: `coordinator_${coordinator.id || Date.now()}`,
      coordinatorId: coordinator.id,
      name: coordinator.name,
      phone: coordinator.phone,
      email: coordinator.email,
      avatarUrl: coordinator.image || coordinator.coordinatorImage || coordinator.avatarUrl,
      role: coordinator.role || 'Koordinator',
      groupName: groupInfo?.name,
      groupId: groupInfo?.id,
      contactType: CONTACT_TYPE.FAVORITE,
      isFavorite: true,
      // These will be populated if they have a user account
      userId: null,
      level: null,
      levelName: null,
      location: null,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newContact, ...contacts];
    await saveContacts(updated);
    return { success: true, isUpdate: false, contact: newContact };
  }, [contacts]);

  // Remove contact
  const removeContact = useCallback(async (contactId) => {
    const updated = contacts.filter(c => c.id !== contactId);
    await saveContacts(updated);
    return { success: true };
  }, [contacts]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (contactId) => {
    const updated = contacts.map(c => 
      c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
    );
    await saveContacts(updated);
    return { success: true };
  }, [contacts]);

  // Get contact by ID
  const getContact = useCallback((contactId) => {
    return contacts.find(c => c.id === contactId) || null;
  }, [contacts]);

  // Check if contact exists
  const hasContact = useCallback((contactId) => {
    return contacts.some(c => c.id === contactId);
  }, [contacts]);

  // Check if coordinator is added as contact
  const hasCoordinatorContact = useCallback((coordinatorPhone, coordinatorEmail) => {
    return contacts.some(c => 
      (coordinatorPhone && c.phone === coordinatorPhone) ||
      (coordinatorEmail && c.email === coordinatorEmail)
    );
  }, [contacts]);

  // Get contacts by type
  const getContactsByType = useCallback((type) => {
    return contacts.filter(c => c.contactType === type);
  }, [contacts]);

  // Get favorite contacts
  const getFavoriteContacts = useCallback(() => {
    return contacts.filter(c => c.isFavorite);
  }, [contacts]);

  // Sync contacts with backend to get latest user data (level, location, etc.)
  const syncContactsWithBackend = useCallback(async () => {
    if (contacts.length === 0) return;

    try {
      // Get phone numbers to look up
      const phoneNumbers = contacts
        .filter(c => c.phone)
        .map(c => c.phone);

      if (phoneNumbers.length === 0) return;

      const response = await fetch(`${API_BASE_URL}/users/lookup.php?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({ phoneNumbers }),
      });

      const data = await response.json();

      if (data.success && data.users) {
        // Update contacts with backend data
        const updated = contacts.map(contact => {
          const backendUser = data.users.find(u => u.phone === contact.phone);
          if (backendUser) {
            return {
              ...contact,
              userId: backendUser.id,
              name: backendUser.name || contact.name,
              email: backendUser.email || contact.email,
              level: backendUser.level,
              levelName: backendUser.levelName,
              totalPoints: backendUser.totalPoints,
              completedActivities: backendUser.completedActivities,
              completedExpeditions: backendUser.completedExpeditions,
              location: backendUser.location?.sharing ? backendUser.location : null,
              avatarUrl: backendUser.avatarUrl || contact.avatarUrl,
              memberSince: backendUser.memberSince,
              updatedAt: new Date().toISOString(),
            };
          }
          return contact;
        });

        await saveContacts(updated);
        return { success: true, updatedCount: data.users.length };
      }

      return { success: false };
    } catch (error) {
      console.error('Error syncing contacts with backend:', error);
      return { success: false, error: error.message };
    }
  }, [contacts]);

  // Get contacts with location sharing enabled
  const getContactsWithLocation = useCallback(() => {
    return contacts.filter(c => c.location && c.location.sharing && c.location.latitude && c.location.longitude);
  }, [contacts]);

  return {
    contacts,
    loading,
    addContact,
    addFavoriteCoordinator,
    removeContact,
    toggleFavorite,
    getContact,
    hasContact,
    hasCoordinatorContact,
    getContactsByType,
    getFavoriteContacts,
    getContactsWithLocation,
    syncContactsWithBackend,
    loadContacts,
    CONTACT_TYPE,
  };
};

export default useContacts;

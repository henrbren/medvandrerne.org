import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const LOCATION_SHARING_KEY = '@medvandrerne_location_sharing';
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const API_BASE_URL = 'https://henrikb30.sg-host.com/api';

export const useLocationSharing = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [contactLocations, setContactLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Load sharing preference on mount
  useEffect(() => {
    loadSharingPreference();
  }, []);

  // Start/stop location updates based on sharing preference
  useEffect(() => {
    let locationSubscription = null;
    let updateInterval = null;

    const startLocationUpdates = async () => {
      if (!isSharing) return;

      try {
        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        });

        // Sync to backend
        await syncLocationToBackend(location.coords);

        // Start watching for updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: LOCATION_UPDATE_INTERVAL,
            distanceInterval: 100, // meters
          },
          (location) => {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toISOString(),
            });
            syncLocationToBackend(location.coords);
          }
        );

        // Also sync periodically
        updateInterval = setInterval(async () => {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          syncLocationToBackend(loc.coords);
        }, LOCATION_UPDATE_INTERVAL);

      } catch (error) {
        console.error('Error starting location updates:', error);
      }
    };

    if (isSharing && permissionStatus === 'granted') {
      startLocationUpdates();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [isSharing, permissionStatus]);

  const loadSharingPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_SHARING_KEY);
      if (stored !== null) {
        setIsSharing(JSON.parse(stored));
      }
      
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
    } catch (error) {
      console.error('Error loading sharing preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const toggleLocationSharing = async () => {
    try {
      if (!isSharing) {
        // Turning ON - need to check/request permission
        const hasPermission = permissionStatus === 'granted' || await requestLocationPermission();
        
        if (!hasPermission) {
          return { success: false, error: 'Tilgang til posisjon ble ikke gitt' };
        }

        setIsSharing(true);
        await AsyncStorage.setItem(LOCATION_SHARING_KEY, JSON.stringify(true));
        
        // Get and sync location immediately
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        });
        
        await syncLocationToBackend(location.coords);
        
        return { success: true };
      } else {
        // Turning OFF
        setIsSharing(false);
        await AsyncStorage.setItem(LOCATION_SHARING_KEY, JSON.stringify(false));
        
        // Clear location from backend
        await clearLocationFromBackend();
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error toggling location sharing:', error);
      return { success: false, error: error.message };
    }
  };

  const syncLocationToBackend = async (coords) => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/location/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to sync location:', data.error);
      }
    } catch (error) {
      console.error('Error syncing location to backend:', error);
    }
  };

  const clearLocationFromBackend = async () => {
    if (!token || !user) return;

    try {
      await fetch(`${API_BASE_URL}/location/clear.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error clearing location from backend:', error);
    }
  };

  const fetchContactLocations = useCallback(async (contactIds) => {
    if (!contactIds || contactIds.length === 0) {
      setContactLocations([]);
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/location/contacts.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          contactIds,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.locations) {
        setContactLocations(data.locations);
        return data.locations;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching contact locations:', error);
      return [];
    }
  }, [token]);

  return {
    isSharing,
    currentLocation,
    contactLocations,
    loading,
    permissionStatus,
    toggleLocationSharing,
    requestLocationPermission,
    fetchContactLocations,
  };
};

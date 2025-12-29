/**
 * API Service for Medvandrerne App
 * Håndterer kommunikasjon med backend og caching
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://henrikb30.sg-host.com/api';
const CACHE_KEY = '@medvandrerne_api_cache';
const CACHE_TIMESTAMP_KEY = '@medvandrerne_api_cache_timestamp';

// Different cache durations for different data types
const CACHE_DURATIONS = {
  default: 30 * 60 * 1000,      // 30 minutter for generelle data
  activities: 5 * 60 * 1000,    // 5 minutter for aktiviteter (endres ofte)
  calendar: 5 * 60 * 1000,      // 5 minutter for kalender
  news: 15 * 60 * 1000,         // 15 minutter for nyheter
  static: 24 * 60 * 60 * 1000,  // 24 timer for statiske data (organization, mission, etc.)
};

// Track individual cache timestamps for different data types
const CACHE_TYPE_TIMESTAMPS_KEY = '@medvandrerne_cache_type_timestamps';

/**
 * Get cache duration for a specific data type
 */
function getCacheDuration(type) {
  const staticTypes = ['organization', 'mission', 'coreActivities', 'supporters'];
  if (staticTypes.includes(type)) return CACHE_DURATIONS.static;
  if (type === 'activities' || type === 'calendar') return CACHE_DURATIONS.activities;
  if (type === 'news') return CACHE_DURATIONS.news;
  return CACHE_DURATIONS.default;
}

/**
 * Sjekk om cache er gyldig for en spesifikk type
 */
async function isCacheValidForType(type = 'default') {
  try {
    const timestampsJson = await AsyncStorage.getItem(CACHE_TYPE_TIMESTAMPS_KEY);
    const timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
    const timestamp = timestamps[type];
    
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    const duration = getCacheDuration(type);
    return cacheAge < duration;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Sjekk om generell cache er gyldig (legacy support)
 */
async function isCacheValid() {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge < CACHE_DURATIONS.default;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Set cache timestamp for a specific type
 */
async function setCacheTimestamp(type) {
  try {
    const timestampsJson = await AsyncStorage.getItem(CACHE_TYPE_TIMESTAMPS_KEY);
    const timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
    timestamps[type] = Date.now().toString();
    await AsyncStorage.setItem(CACHE_TYPE_TIMESTAMPS_KEY, JSON.stringify(timestamps));
  } catch (error) {
    console.error('Error setting cache timestamp:', error);
  }
}

/**
 * Hent data fra cache
 */
async function getCachedData() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Lagre data i cache
 */
async function setCachedData(data) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

/**
 * Hent alle data fra API
 */
export async function fetchAllData(forceRefresh = false) {
  try {
    // Sjekk cache først hvis ikke force refresh
    if (!forceRefresh) {
      const isValid = await isCacheValid();
      if (isValid) {
        const cached = await getCachedData();
        if (cached) {
          console.log('Using cached data');
          return cached;
        }
      }
    }

    // Hent fra API
    console.log('Fetching data from API...');
    const response = await fetch(`${API_BASE_URL}/all.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Lagre i cache
    await setCachedData(data);
    
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    
    // Prøv å bruke cache selv om den er utløpt hvis API feiler
    const cached = await getCachedData();
    if (cached) {
      console.log('API failed, using stale cache');
      return cached;
    }
    
    // Fallback til default data hvis både API og cache feiler
    throw error;
  }
}

/**
 * Hent spesifikk datatype fra API
 */
export async function fetchDataType(type, forceRefresh = false) {
  try {
    // Sjekk type-spesifikk cache først
    if (!forceRefresh) {
      const isValid = await isCacheValidForType(type);
      if (isValid) {
        const cached = await getCachedData();
        if (cached && cached[type]) {
          console.log(`Using cached ${type} data`);
          return cached[type];
        }
      }
    }

    // Hent fra API
    const endpointMap = {
      organization: 'organization.php',
      mission: 'mission.php',
      coreActivities: 'core-activities.php',
      localGroups: 'local-groups.php',
      administration: 'administration.php',
      board: 'board.php',
      activities: 'activities.php',
      supporters: 'supporters.php',
      news: 'news.php',
      calendar: 'calendar.php',
      resources: 'resources.php',
    };

    const endpoint = endpointMap[type];
    if (!endpoint) {
      throw new Error(`Unknown data type: ${type}`);
    }

    console.log(`Fetching fresh ${type} data from API...`);
    const response = await fetch(`${API_BASE_URL}/${endpoint}?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Oppdater cache og timestamp
    const cached = await getCachedData() || {};
    cached[type] = data;
    await setCachedData(cached);
    await setCacheTimestamp(type);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    
    // Prøv cache som fallback
    const cached = await getCachedData();
    if (cached && cached[type]) {
      console.log(`API failed, using stale ${type} cache`);
      return cached[type];
    }
    
    throw error;
  }
}

/**
 * Tøm cache
 */
export async function clearCache() {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
    await AsyncStorage.removeItem(CACHE_TYPE_TIMESTAMPS_KEY);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Tøm cache for en spesifikk type (tvinger refresh neste gang)
 */
export async function clearCacheForType(type) {
  try {
    const timestampsJson = await AsyncStorage.getItem(CACHE_TYPE_TIMESTAMPS_KEY);
    const timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
    delete timestamps[type];
    await AsyncStorage.setItem(CACHE_TYPE_TIMESTAMPS_KEY, JSON.stringify(timestamps));
    console.log(`Cache cleared for ${type}`);
  } catch (error) {
    console.error(`Error clearing cache for ${type}:`, error);
  }
}

/**
 * Invalidate all dynamic caches (keep static ones)
 */
export async function invalidateDynamicCaches() {
  try {
    const timestampsJson = await AsyncStorage.getItem(CACHE_TYPE_TIMESTAMPS_KEY);
    const timestamps = timestampsJson ? JSON.parse(timestampsJson) : {};
    
    // Only keep static data timestamps
    const staticTypes = ['organization', 'mission', 'coreActivities', 'supporters'];
    const newTimestamps = {};
    staticTypes.forEach(type => {
      if (timestamps[type]) {
        newTimestamps[type] = timestamps[type];
      }
    });
    
    await AsyncStorage.setItem(CACHE_TYPE_TIMESTAMPS_KEY, JSON.stringify(newTimestamps));
    console.log('Dynamic caches invalidated');
  } catch (error) {
    console.error('Error invalidating dynamic caches:', error);
  }
}

/**
 * Sjekk om appen er online
 */
export function isOnline() {
  // Enkel sjekk - kan utvides med NetInfo hvis nødvendig
  return true; // Antar at vi alltid prøver å hente fra API først
}

/**
 * Send push notification when someone is added as a contact
 * @param {Object} params - Notification parameters
 * @param {string} params.targetUserId - The user ID who was added (receives notification)
 * @param {string} params.addedByName - Name of person who added them
 * @param {number} params.addedByLevel - Level of person who added them
 * @param {string} params.addedById - ID of person who added them
 */
export async function notifyContactAdded({ targetUserId, addedByName, addedByLevel, addedById }) {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/notify-added.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        targetUserId,
        addedByName,
        addedByLevel,
        addedById,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending contact added notification:', error);
    // Don't throw - this is a non-critical operation
    return { success: false, error: error.message };
  }
}


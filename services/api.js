/**
 * API Service for Medvandrerne App
 * Håndterer kommunikasjon med backend og caching
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://henrikb30.sg-host.com/api';
const CACHE_KEY = '@medvandrerne_api_cache';
const CACHE_TIMESTAMP_KEY = '@medvandrerne_api_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 timer i millisekunder

/**
 * Sjekk om cache er gyldig
 */
async function isCacheValid() {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge < CACHE_DURATION;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
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
    // Sjekk cache først
    if (!forceRefresh) {
      const cached = await getCachedData();
      if (cached && cached[type]) {
        return cached[type];
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

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Oppdater cache
    const cached = await getCachedData() || {};
    cached[type] = data;
    await setCachedData(cached);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    
    // Prøv cache som fallback
    const cached = await getCachedData();
    if (cached && cached[type]) {
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
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Sjekk om appen er online
 */
export function isOnline() {
  // Enkel sjekk - kan utvides med NetInfo hvis nødvendig
  return true; // Antar at vi alltid prøver å hente fra API først
}


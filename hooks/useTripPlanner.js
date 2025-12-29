import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIPS_STORAGE_KEY = '@medvandrerne_trips';
const TRIP_ROUTES_STORAGE_KEY = '@medvandrerne_trip_routes';

// XP rewards for trips
export const TRIP_XP_REWARDS = {
  BASE_XP: 75, // Base XP for completing a trip
  PER_KM: 10, // XP per kilometer
  PER_100M_ELEVATION: 15, // XP per 100m elevation gain
  DIFFICULTY_BONUS: {
    easy: 0,
    moderate: 25,
    hard: 50,
    expert: 100,
  },
  WEATHER_BONUS: {
    sunny: 0,
    cloudy: 10,
    rain: 30,
    snow: 50,
  },
};

// Calculate XP for a trip
export const calculateTripXP = (trip) => {
  let xp = TRIP_XP_REWARDS.BASE_XP;
  
  // Distance bonus
  if (trip.distance) {
    xp += Math.floor(trip.distance * TRIP_XP_REWARDS.PER_KM);
  }
  
  // Elevation bonus
  if (trip.elevationGain) {
    xp += Math.floor((trip.elevationGain / 100) * TRIP_XP_REWARDS.PER_100M_ELEVATION);
  }
  
  // Difficulty bonus
  if (trip.difficulty && TRIP_XP_REWARDS.DIFFICULTY_BONUS[trip.difficulty]) {
    xp += TRIP_XP_REWARDS.DIFFICULTY_BONUS[trip.difficulty];
  }
  
  // Weather bonus (for braving the elements)
  if (trip.weatherCondition && TRIP_XP_REWARDS.WEATHER_BONUS[trip.weatherCondition]) {
    xp += TRIP_XP_REWARDS.WEATHER_BONUS[trip.weatherCondition];
  }
  
  return xp;
};

// OpenRouteService API for routing and elevation
const ORS_API_KEY = '5b3ce3597851110001cf6248a2e0b5f88e0d4c9a93a8f0e0e8b3c5a7'; // Free tier key (replace with real key)
const MET_NO_API = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Search for hiking trails near a location
export const searchHikingTrails = async (lat, lon, radius = 10000) => {
  const query = `
    [out:json][timeout:25];
    (
      way["highway"="path"]["sac_scale"](around:${radius},${lat},${lon});
      way["route"="hiking"](around:${radius},${lat},${lon});
      relation["route"="hiking"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) throw new Error('Failed to fetch trails');
    
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error searching trails:', error);
    return [];
  }
};

// Get route between two points with elevation profile
export const getRoute = async (start, end, profile = 'foot-hiking') => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${ORS_API_KEY}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/geo+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get route: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Get elevation profile for a route
export const getElevationProfile = async (coordinates) => {
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/elevation/line',
      {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format_in: 'geojson',
          format_out: 'geojson',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to get elevation');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting elevation:', error);
    return null;
  }
};

// Get weather forecast for a location
export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await fetch(
      `${MET_NO_API}?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'Medvandrerne-App/1.0 (kontakt@medvandrerne.no)',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to get weather');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting weather:', error);
    return null;
  }
};

// Geocode a location name to coordinates
export const geocodeLocation = async (query, countryCode = 'NO') => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=${countryCode}&format=json&limit=5`,
      {
        headers: {
          'User-Agent': 'Medvandrerne-App/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to geocode');

    const data = await response.json();
    return data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      category: item.category,
    }));
  } catch (error) {
    console.error('Error geocoding:', error);
    return [];
  }
};

// Reverse geocode coordinates to location name
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'Medvandrerne-App/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to reverse geocode');

    const data = await response.json();
    return {
      name: data.display_name,
      address: data.address,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Popular Norwegian hiking destinations with coordinates
export const POPULAR_DESTINATIONS = [
  { id: 1, name: 'Preikestolen', lat: 58.9867, lon: 6.1871, region: 'Rogaland', difficulty: 'moderate', distance: 8, elevation: 334 },
  { id: 2, name: 'Trolltunga', lat: 60.1243, lon: 6.7400, region: 'Hordaland', difficulty: 'hard', distance: 27, elevation: 800 },
  { id: 3, name: 'Galdhøpiggen', lat: 61.6368, lon: 8.3125, region: 'Jotunheimen', difficulty: 'hard', distance: 10, elevation: 1850 },
  { id: 4, name: 'Besseggen', lat: 61.5158, lon: 9.0417, region: 'Jotunheimen', difficulty: 'moderate', distance: 14, elevation: 900 },
  { id: 5, name: 'Kjeragbolten', lat: 59.0336, lon: 6.5781, region: 'Rogaland', difficulty: 'hard', distance: 10, elevation: 570 },
  { id: 6, name: 'Romsdalseggen', lat: 62.4642, lon: 7.7372, region: 'Møre og Romsdal', difficulty: 'hard', distance: 10, elevation: 800 },
  { id: 7, name: 'Vettisfossen', lat: 61.3447, lon: 7.9783, region: 'Sogn og Fjordane', difficulty: 'easy', distance: 5, elevation: 300 },
  { id: 8, name: 'Reinebringen', lat: 67.9489, lon: 13.0758, region: 'Lofoten', difficulty: 'moderate', distance: 3, elevation: 448 },
  { id: 9, name: 'Gaustatoppen', lat: 59.8514, lon: 8.6511, region: 'Telemark', difficulty: 'moderate', distance: 6, elevation: 500 },
  { id: 10, name: 'Skåla', lat: 61.8828, lon: 6.8444, region: 'Sogn og Fjordane', difficulty: 'hard', distance: 16, elevation: 1800 },
  { id: 11, name: 'Molden', lat: 61.2847, lon: 7.3158, region: 'Sogn og Fjordane', difficulty: 'moderate', distance: 10, elevation: 700 },
  { id: 12, name: 'Tjørhomfjellet', lat: 60.5833, lon: 5.3333, region: 'Hordaland', difficulty: 'easy', distance: 4, elevation: 350 },
];

// Difficulty levels with descriptions
export const DIFFICULTY_LEVELS = [
  { key: 'easy', label: 'Lett', icon: 'walk-outline', color: '#32D74B', description: 'Enkel sti, passer for alle' },
  { key: 'moderate', label: 'Moderat', icon: 'trending-up', color: '#FFD60A', description: 'Noe krevende, god kondisjon anbefalt' },
  { key: 'hard', label: 'Krevende', icon: 'fitness', color: '#FF9500', description: 'Utfordrende terreng, erfaring anbefalt' },
  { key: 'expert', label: 'Ekspert', icon: 'warning', color: '#FF453A', description: 'Kun for erfarne fjellfolk' },
];

// Main hook for trip planning
export const useTripPlanner = () => {
  const [trips, setTrips] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Load trips and routes from storage
  const loadData = useCallback(async () => {
    try {
      const [tripsData, routesData] = await Promise.all([
        AsyncStorage.getItem(TRIPS_STORAGE_KEY),
        AsyncStorage.getItem(TRIP_ROUTES_STORAGE_KEY),
      ]);

      if (tripsData) {
        setTrips(JSON.parse(tripsData));
      }
      if (routesData) {
        setSavedRoutes(JSON.parse(routesData));
      }
    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save a completed trip
  const saveTrip = async (tripData) => {
    try {
      const xpEarned = calculateTripXP(tripData);
      const newTrip = {
        id: Date.now().toString(),
        ...tripData,
        xpEarned,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updatedTrips = [newTrip, ...trips];
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
      
      return newTrip;
    } catch (error) {
      console.error('Error saving trip:', error);
      throw error;
    }
  };

  // Save a planned route for later
  const saveRoute = async (routeData) => {
    try {
      const newRoute = {
        id: Date.now().toString(),
        ...routeData,
        createdAt: new Date().toISOString(),
      };

      const updatedRoutes = [newRoute, ...savedRoutes];
      await AsyncStorage.setItem(TRIP_ROUTES_STORAGE_KEY, JSON.stringify(updatedRoutes));
      setSavedRoutes(updatedRoutes);
      
      return newRoute;
    } catch (error) {
      console.error('Error saving route:', error);
      throw error;
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId) => {
    try {
      const updatedTrips = trips.filter(t => t.id !== tripId);
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  // Delete a saved route
  const deleteRoute = async (routeId) => {
    try {
      const updatedRoutes = savedRoutes.filter(r => r.id !== routeId);
      await AsyncStorage.setItem(TRIP_ROUTES_STORAGE_KEY, JSON.stringify(updatedRoutes));
      setSavedRoutes(updatedRoutes);
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  };

  // Search for locations
  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await geocodeLocation(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get statistics
  const getStats = useCallback(() => {
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalElevation = trips.reduce((sum, t) => sum + (t.elevationGain || 0), 0);
    const totalXP = trips.reduce((sum, t) => sum + (t.xpEarned || 0), 0);
    
    const thisYear = new Date().getFullYear();
    const tripsThisYear = trips.filter(t => new Date(t.completedAt).getFullYear() === thisYear);
    const distanceThisYear = tripsThisYear.reduce((sum, t) => sum + (t.distance || 0), 0);
    
    return {
      totalTrips,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalElevation: Math.round(totalElevation),
      totalXP,
      tripsThisYear: tripsThisYear.length,
      distanceThisYear: Math.round(distanceThisYear * 10) / 10,
    };
  }, [trips]);

  return {
    trips,
    savedRoutes,
    loading,
    searchLoading,
    searchResults,
    saveTrip,
    saveRoute,
    deleteTrip,
    deleteRoute,
    searchLocations,
    getStats,
    loadData,
    // Utility functions
    getRoute,
    getElevationProfile,
    getWeatherForecast,
    searchHikingTrails,
    geocodeLocation,
    reverseGeocode,
  };
};

export default useTripPlanner;


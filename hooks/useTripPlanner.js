import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIPS_STORAGE_KEY = '@medvandrerne_trips';
const TRIP_ROUTES_STORAGE_KEY = '@medvandrerne_trip_routes';

// XP rewards for trips - redesigned to reward motivation over distance
// Philosophy: Getting out the door is the hardest part!
export const TRIP_XP_REWARDS = {
  // High base XP - just getting out is an achievement
  BASE_XP: 50,
  
  // Motivation bonus for short trips (under 5 km) - you pushed through!
  MOTIVATION_BONUS: 30,
  MOTIVATION_THRESHOLD_KM: 5,
  
  // Distance XP uses logarithmic scaling - first km are most valuable
  // Formula: XP = base + log2(distance + 1) * multiplier
  DISTANCE_MULTIPLIER: 15, // ~15 XP for 1km, ~30 for 3km, ~40 for 7km, ~50 for 15km
  
  // Elevation still rewards effort, but slightly reduced
  PER_100M_ELEVATION: 10, // XP per 100m elevation gain
  
  // Difficulty bonus - pushing your limits
  DIFFICULTY_BONUS: {
    easy: 0,
    moderate: 15,
    hard: 35,
    expert: 60,
  },
  
  // Weather bonus - braving the elements
  WEATHER_BONUS: {
    sunny: 0,
    cloudy: 5,
    rain: 20,
    snow: 35,
  },
  
  // Streak bonus - consecutive days of activity
  STREAK_BONUS_PER_DAY: 5,
  MAX_STREAK_BONUS: 25,
};

// Maximum values to prevent unrealistic trips
export const TRIP_LIMITS = {
  MAX_DISTANCE_KM: 80, // Max 80 km per day trip
  MAX_ELEVATION_M: 3000, // Max 3000m elevation gain
  MAX_XP_PER_TRIP: 300, // Cap XP per trip (much lower - encourages consistent activity)
  MIN_DISTANCE_KM: 0.3, // Min 300m to count as a trip
  MIN_ELEVATION_M: 0, // Elevation can be 0 for flat walks
  // Realistic limits for warnings
  WARNING_DISTANCE_KM: 40, // Warn above 40km
  WARNING_ELEVATION_M: 1500, // Warn above 1500m elevation gain
};

// Validate and sanitize trip data
export const validateTripData = (trip) => {
  const warnings = [];
  const sanitized = { ...trip };
  
  // Validate distance
  if (sanitized.distance !== undefined) {
    if (sanitized.distance < TRIP_LIMITS.MIN_DISTANCE_KM) {
      sanitized.distance = TRIP_LIMITS.MIN_DISTANCE_KM;
      warnings.push(`Avstand satt til minimum ${TRIP_LIMITS.MIN_DISTANCE_KM} km`);
    }
    if (sanitized.distance > TRIP_LIMITS.MAX_DISTANCE_KM) {
      sanitized.distance = TRIP_LIMITS.MAX_DISTANCE_KM;
      warnings.push(`Avstand begrenset til maks ${TRIP_LIMITS.MAX_DISTANCE_KM} km`);
    }
    if (sanitized.distance > TRIP_LIMITS.WARNING_DISTANCE_KM && sanitized.distance <= TRIP_LIMITS.MAX_DISTANCE_KM) {
      warnings.push('Dette er en veldig lang tur - er du sikker på avstanden?');
    }
  }
  
  // Validate elevation
  if (sanitized.elevationGain !== undefined) {
    if (sanitized.elevationGain < TRIP_LIMITS.MIN_ELEVATION_M) {
      sanitized.elevationGain = TRIP_LIMITS.MIN_ELEVATION_M;
    }
    if (sanitized.elevationGain > TRIP_LIMITS.MAX_ELEVATION_M) {
      sanitized.elevationGain = TRIP_LIMITS.MAX_ELEVATION_M;
      warnings.push(`Høydemeter begrenset til maks ${TRIP_LIMITS.MAX_ELEVATION_M} m`);
    }
    if (sanitized.elevationGain > TRIP_LIMITS.WARNING_ELEVATION_M && sanitized.elevationGain <= TRIP_LIMITS.MAX_ELEVATION_M) {
      warnings.push('Dette er mye høydemeter - er du sikker på verdien?');
    }
  }
  
  // Check for unrealistic combinations
  if (sanitized.distance && sanitized.elevationGain) {
    // More than 100m elevation per km is very steep (10% average grade)
    const avgGrade = (sanitized.elevationGain / (sanitized.distance * 1000)) * 100;
    if (avgGrade > 20) {
      warnings.push('Kombinasjonen av avstand og høydemeter virker veldig bratt');
    }
  }
  
  return { sanitized, warnings };
};

// Calculate XP for a trip (with limits)
// Philosophy: Reward consistency and motivation, not just distance
export const calculateTripXP = (trip) => {
  // Validate and sanitize first
  const { sanitized } = validateTripData(trip);
  
  let xp = TRIP_XP_REWARDS.BASE_XP;
  
  // Distance bonus using logarithmic scaling
  // This means: 1km ≈ 15 XP, 5km ≈ 39 XP, 10km ≈ 52 XP, 20km ≈ 65 XP, 50km ≈ 85 XP
  // The first few km are most valuable!
  if (sanitized.distance) {
    const cappedDistance = Math.min(sanitized.distance, TRIP_LIMITS.MAX_DISTANCE_KM);
    const distanceXP = Math.floor(Math.log2(cappedDistance + 1) * TRIP_XP_REWARDS.DISTANCE_MULTIPLIER);
    xp += distanceXP;
    
    // Motivation bonus for short trips (under 5 km)
    // Getting out for a short walk when you don't feel like it is HARD
    if (cappedDistance <= TRIP_XP_REWARDS.MOTIVATION_THRESHOLD_KM) {
      xp += TRIP_XP_REWARDS.MOTIVATION_BONUS;
    }
  }
  
  // Elevation bonus (capped)
  if (sanitized.elevationGain) {
    const cappedElevation = Math.min(sanitized.elevationGain, TRIP_LIMITS.MAX_ELEVATION_M);
    xp += Math.floor((cappedElevation / 100) * TRIP_XP_REWARDS.PER_100M_ELEVATION);
  }
  
  // Difficulty bonus
  if (sanitized.difficulty && TRIP_XP_REWARDS.DIFFICULTY_BONUS[sanitized.difficulty]) {
    xp += TRIP_XP_REWARDS.DIFFICULTY_BONUS[sanitized.difficulty];
  }
  
  // Weather bonus (for braving the elements)
  if (sanitized.weatherCondition && TRIP_XP_REWARDS.WEATHER_BONUS[sanitized.weatherCondition]) {
    xp += TRIP_XP_REWARDS.WEATHER_BONUS[sanitized.weatherCondition];
  }
  
  // Apply max XP cap
  return Math.min(xp, TRIP_LIMITS.MAX_XP_PER_TRIP);
};

// Helper to show XP breakdown for UI
export const getXPBreakdown = (trip) => {
  const { sanitized } = validateTripData(trip);
  const breakdown = [];
  
  breakdown.push({ label: 'Grunnlag (kom deg ut!)', xp: TRIP_XP_REWARDS.BASE_XP, icon: 'walk' });
  
  if (sanitized.distance) {
    const cappedDistance = Math.min(sanitized.distance, TRIP_LIMITS.MAX_DISTANCE_KM);
    const distanceXP = Math.floor(Math.log2(cappedDistance + 1) * TRIP_XP_REWARDS.DISTANCE_MULTIPLIER);
    breakdown.push({ label: `Distanse (${cappedDistance} km)`, xp: distanceXP, icon: 'navigate' });
    
    if (cappedDistance <= TRIP_XP_REWARDS.MOTIVATION_THRESHOLD_KM) {
      breakdown.push({ label: 'Motivasjonsbonus! 💪', xp: TRIP_XP_REWARDS.MOTIVATION_BONUS, icon: 'heart' });
    }
  }
  
  if (sanitized.elevationGain) {
    const cappedElevation = Math.min(sanitized.elevationGain, TRIP_LIMITS.MAX_ELEVATION_M);
    const elevationXP = Math.floor((cappedElevation / 100) * TRIP_XP_REWARDS.PER_100M_ELEVATION);
    breakdown.push({ label: `Høydemeter (${cappedElevation}m)`, xp: elevationXP, icon: 'trending-up' });
  }
  
  if (sanitized.difficulty && TRIP_XP_REWARDS.DIFFICULTY_BONUS[sanitized.difficulty]) {
    const diffXP = TRIP_XP_REWARDS.DIFFICULTY_BONUS[sanitized.difficulty];
    if (diffXP > 0) {
      breakdown.push({ label: 'Vanskelighetsgrad', xp: diffXP, icon: 'fitness' });
    }
  }
  
  if (sanitized.weatherCondition && TRIP_XP_REWARDS.WEATHER_BONUS[sanitized.weatherCondition]) {
    const weatherXP = TRIP_XP_REWARDS.WEATHER_BONUS[sanitized.weatherCondition];
    if (weatherXP > 0) {
      breakdown.push({ label: 'Værutfordring', xp: weatherXP, icon: 'rainy' });
    }
  }
  
  const total = breakdown.reduce((sum, item) => sum + item.xp, 0);
  const capped = Math.min(total, TRIP_LIMITS.MAX_XP_PER_TRIP);
  
  return { breakdown, total, capped, wasCapped: total > capped };
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
      // Validate and sanitize trip data
      const { sanitized, warnings } = validateTripData(tripData);
      
      const xpEarned = calculateTripXP(sanitized);
      const newTrip = {
        id: Date.now().toString(),
        ...sanitized,
        xpEarned,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        // Store original values if they were capped
        originalDistance: tripData.distance !== sanitized.distance ? tripData.distance : undefined,
        originalElevation: tripData.elevationGain !== sanitized.elevationGain ? tripData.elevationGain : undefined,
        wasCapped: tripData.distance !== sanitized.distance || tripData.elevationGain !== sanitized.elevationGain,
      };

      const updatedTrips = [newTrip, ...trips];
      await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
      
      return { trip: newTrip, warnings };
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
    
    // Achievement-related stats
    const motivationTrips = trips.filter(t => (t.distance || 0) <= TRIP_XP_REWARDS.MOTIVATION_THRESHOLD_KM).length;
    const rainTrips = trips.filter(t => t.weatherCondition === 'rain').length;
    const snowTrips = trips.filter(t => t.weatherCondition === 'snow').length;
    const hardTrips = trips.filter(t => t.difficulty === 'hard').length;
    const expertTrips = trips.filter(t => t.difficulty === 'expert').length;
    
    // Find longest single trip and highest elevation single trip
    const longestTrip = trips.reduce((max, t) => Math.max(max, t.distance || 0), 0);
    const highestElevationTrip = trips.reduce((max, t) => Math.max(max, t.elevationGain || 0), 0);
    
    return {
      totalTrips,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalElevation: Math.round(totalElevation),
      totalXP,
      tripsThisYear: tripsThisYear.length,
      distanceThisYear: Math.round(distanceThisYear * 10) / 10,
      // For achievements
      motivationTrips,
      rainTrips,
      snowTrips,
      hardTrips,
      expertTrips,
      longestTrip: Math.round(longestTrip * 10) / 10,
      highestElevationTrip: Math.round(highestElevationTrip),
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


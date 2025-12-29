import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Easing,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import XPCelebration from '../components/XPCelebration';
import { 
  useTripPlanner, 
  POPULAR_DESTINATIONS, 
  DIFFICULTY_LEVELS,
  TRIP_LIMITS,
  TRIP_XP_REWARDS,
  calculateTripXP,
  getXPBreakdown,
  validateTripData,
  getWeatherForecast,
  geocodeLocation,
} from '../hooks/useTripPlanner';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Weather icon mapping
const getWeatherIcon = (symbolCode) => {
  if (!symbolCode) return 'partly-sunny';
  if (symbolCode.includes('clearsky')) return 'sunny';
  if (symbolCode.includes('fair')) return 'partly-sunny';
  if (symbolCode.includes('cloudy')) return 'cloudy';
  if (symbolCode.includes('rain')) return 'rainy';
  if (symbolCode.includes('snow')) return 'snow';
  if (symbolCode.includes('thunder')) return 'thunderstorm';
  if (symbolCode.includes('fog')) return 'cloudy';
  return 'partly-sunny';
};

// Weather color mapping
const getWeatherColor = (symbolCode) => {
  if (!symbolCode) return theme.colors.info;
  if (symbolCode.includes('clearsky') || symbolCode.includes('fair')) return '#FFD60A';
  if (symbolCode.includes('cloudy')) return theme.colors.textSecondary;
  if (symbolCode.includes('rain')) return theme.colors.info;
  if (symbolCode.includes('snow')) return '#A5D8FF';
  if (symbolCode.includes('thunder')) return '#FF9500';
  return theme.colors.info;
};

// Elevation chart component
const ElevationChart = ({ elevationData, distance }) => {
  if (!elevationData || elevationData.length === 0) return null;
  
  const maxElevation = Math.max(...elevationData);
  const minElevation = Math.min(...elevationData);
  const range = maxElevation - minElevation || 1;
  
  return (
    <View style={styles.elevationChart}>
      <View style={styles.elevationYAxis}>
        <Text style={styles.elevationLabel}>{Math.round(maxElevation)}m</Text>
        <Text style={styles.elevationLabel}>{Math.round(minElevation)}m</Text>
      </View>
      <View style={styles.elevationBars}>
        {elevationData.slice(0, 50).map((elevation, index) => {
          const heightPercent = ((elevation - minElevation) / range) * 100;
          return (
            <View key={index} style={styles.elevationBarContainer}>
              <LinearGradient
                colors={[theme.colors.success, theme.colors.success + '60']}
                style={[styles.elevationBar, { height: `${Math.max(heightPercent, 5)}%` }]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.elevationXAxis}>
        <Text style={styles.elevationLabel}>0 km</Text>
        <Text style={styles.elevationLabel}>{distance ? `${distance} km` : ''}</Text>
      </View>
    </View>
  );
};

// XP Preview Component - shows breakdown of XP earned
const XPPreview = ({ trip }) => {
  const { breakdown, capped, wasCapped } = getXPBreakdown(trip);
  
  // Check if this is a motivation trip (short walk)
  const isMotivationTrip = trip.distance && trip.distance <= TRIP_XP_REWARDS.MOTIVATION_THRESHOLD_KM;
  
  return (
    <View style={styles.xpPreview}>
      <LinearGradient
        colors={isMotivationTrip ? [theme.colors.success, '#22C55E'] : [theme.colors.warning, '#FFD60A']}
        style={styles.xpPreviewGradient}
      >
        <Icon name={isMotivationTrip ? 'heart' : 'star'} size={24} color={theme.colors.white} />
        <View style={styles.xpPreviewContent}>
          <Text style={styles.xpPreviewTitle}>
            {isMotivationTrip ? 'Motivasjonstur! 💪' : 'Du vil tjene'}
          </Text>
          <Text style={styles.xpPreviewValue}>+{capped} XP</Text>
          {wasCapped && (
            <Text style={styles.xpCappedNote}>(maks per tur)</Text>
          )}
        </View>
      </LinearGradient>
      <View style={styles.xpBreakdown}>
        {breakdown.map((item, index) => (
          <View key={index} style={styles.xpBreakdownItem}>
            <View style={[
              styles.xpBreakdownIcon,
              item.label.includes('Motivasjon') && { backgroundColor: theme.colors.success + '20' }
            ]}>
              <Icon 
                name={item.icon + '-outline'} 
                size={14} 
                color={item.label.includes('Motivasjon') ? theme.colors.success : theme.colors.textSecondary} 
              />
            </View>
            <Text style={[
              styles.xpBreakdownText,
              item.label.includes('Motivasjon') && { color: theme.colors.success, fontWeight: '600' }
            ]}>
              {item.label}
            </Text>
            <Text style={[
              styles.xpBreakdownValue,
              item.label.includes('Motivasjon') && { color: theme.colors.success }
            ]}>
              +{item.xp}
            </Text>
          </View>
        ))}
        <View style={styles.xpBreakdownDivider} />
        <View style={styles.xpBreakdownItem}>
          <View style={styles.xpBreakdownIcon}>
            <Icon name="checkmark-circle-outline" size={14} color={theme.colors.warning} />
          </View>
          <Text style={[styles.xpBreakdownText, { fontWeight: '700', color: theme.colors.text }]}>
            Totalt
          </Text>
          <Text style={[styles.xpBreakdownValue, { fontWeight: '700', color: theme.colors.warning }]}>
            {capped} XP
          </Text>
        </View>
      </View>
      {isMotivationTrip && (
        <View style={styles.motivationNote}>
          <Icon name="information-circle-outline" size={16} color={theme.colors.success} />
          <Text style={styles.motivationNoteText}>
            Korte turer gir ekstra XP! Å komme seg ut er det viktigste. 🌟
          </Text>
        </View>
      )}
    </View>
  );
};

export default function TripPlannerScreen({ navigation, route }) {
  const { saveTrip, saveRoute, searchLocations, searchResults, searchLoading } = useTripPlanner();
  
  // Form state
  const [tripName, setTripName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [distance, setDistance] = useState('');
  const [elevationGain, setElevationGain] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('moderate');
  const [notes, setNotes] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('sunny');
  
  // UI state
  const [activeTab, setActiveTab] = useState('search'); // search, popular, manual
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // XP Celebration state
  const [showXPCelebration, setShowXPCelebration] = useState(false);
  const [celebrationXP, setCelebrationXP] = useState(0);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Search handler with debounce
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setLocalSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await geocodeLocation(query);
      setLocalSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Fetch weather for selected destination
  const fetchWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const weatherData = await getWeatherForecast(lat, lon);
      if (weatherData?.properties?.timeseries?.[0]) {
        setWeather(weatherData.properties.timeseries[0].data);
      }
    } catch (error) {
      console.error('Weather error:', error);
    } finally {
      setWeatherLoading(false);
    }
  };
  
  // Handle destination selection
  const handleSelectDestination = (destination) => {
    setSelectedDestination(destination);
    setTripName(destination.name);
    setDistance(destination.distance?.toString() || '');
    setElevationGain(destination.elevation?.toString() || '');
    setDifficulty(destination.difficulty || 'moderate');
    
    if (destination.lat && destination.lon) {
      fetchWeather(destination.lat, destination.lon);
    }
  };
  
  // Handle search result selection
  const handleSelectSearchResult = (result) => {
    const destination = {
      id: result.id,
      name: result.name.split(',')[0],
      lat: result.lat,
      lon: result.lon,
      region: result.name.split(',')[1]?.trim() || '',
    };
    setSelectedDestination(destination);
    setTripName(destination.name);
    setSearchQuery('');
    setLocalSearchResults([]);
    
    if (destination.lat && destination.lon) {
      fetchWeather(destination.lat, destination.lon);
    }
  };
  
  // Build trip object for XP calculation
  const currentTrip = {
    name: tripName,
    distance: parseFloat(distance) || 0,
    elevationGain: parseFloat(elevationGain) || 0,
    duration: duration,
    difficulty: difficulty,
    weatherCondition: weatherCondition,
    startPoint: startPoint,
    endPoint: endPoint,
    destination: selectedDestination,
    notes: notes,
  };
  
  // Save trip
  const handleSaveTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Feil', 'Vennligst gi turen et navn');
      return;
    }
    
    // Validate trip data first
    const { warnings } = validateTripData(currentTrip);
    
    // If there are warnings about unrealistic values, confirm with user
    if (warnings.length > 0) {
      Alert.alert(
        '⚠️ Merk',
        warnings.join('\n\n') + '\n\nVil du fortsette?',
        [
          { text: 'Avbryt', style: 'cancel' },
          { 
            text: 'Fortsett', 
            onPress: () => doSaveTrip(),
          },
        ]
      );
    } else {
      doSaveTrip();
    }
  };
  
  const doSaveTrip = async () => {
    setSaving(true);
    try {
      const result = await saveTrip(currentTrip);
      const { trip, warnings } = result;
      
      // Show XP celebration overlay
      setCelebrationXP(trip.xpEarned);
      setShowXPCelebration(true);
      
      // If values were capped, show a brief note
      if (trip.wasCapped) {
        setTimeout(() => {
          Alert.alert(
            'Merk',
            'Noen verdier ble justert til maksgrensene for å holde XP realistisk.',
            [{ text: 'OK' }]
          );
        }, 500);
      }
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke lagre turen. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCelebrationComplete = () => {
    setShowXPCelebration(false);
    navigation.goBack();
  };
  
  // Save as planned route
  const handleSaveAsRoute = async () => {
    if (!tripName.trim()) {
      Alert.alert('Feil', 'Vennligst gi ruten et navn');
      return;
    }
    
    setSaving(true);
    try {
      await saveRoute(currentTrip);
      Alert.alert(
        'Rute lagret!',
        'Ruten er lagret til "Mine planlagte turer".',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke lagre ruten. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[theme.colors.success, '#22C55E']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Icon name="map" size={40} color={theme.colors.white} />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Planlegg en tur</Text>
                <Text style={styles.headerSubtitle}>Finn din neste eventyr og tjen XP</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.tabActive]}
            onPress={() => setActiveTab('search')}
          >
            <Icon 
              name="search-outline" 
              size={20} 
              color={activeTab === 'search' ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
              Søk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'popular' && styles.tabActive]}
            onPress={() => setActiveTab('popular')}
          >
            <Icon 
              name="star-outline" 
              size={20} 
              color={activeTab === 'popular' ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'popular' && styles.tabTextActive]}>
              Populære
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.tabActive]}
            onPress={() => setActiveTab('manual')}
          >
            <Icon 
              name="create-outline" 
              size={20} 
              color={activeTab === 'manual' ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
              Manuelt
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Tab */}
        {activeTab === 'search' && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Søk etter destinasjon..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {isSearching && <ActivityIndicator size="small" color={theme.colors.success} />}
            </View>
            
            {localSearchResults.length > 0 && (
              <View style={styles.searchResults}>
                {localSearchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(result)}
                  >
                    <Icon name="location-outline" size={20} color={theme.colors.success} />
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultName}>{result.name.split(',')[0]}</Text>
                      <Text style={styles.searchResultRegion} numberOfLines={1}>
                        {result.name.split(',').slice(1).join(',')}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {searchQuery.length >= 2 && localSearchResults.length === 0 && !isSearching && (
              <View style={styles.noResults}>
                <Icon name="search-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.noResultsText}>Ingen resultater funnet</Text>
                <Text style={styles.noResultsSubtext}>Prøv et annet søkeord</Text>
              </View>
            )}
          </Animated.View>
        )}
        
        {/* Popular Destinations Tab */}
        {activeTab === 'popular' && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Populære turer i Norge</Text>
            <View style={styles.destinationsGrid}>
              {POPULAR_DESTINATIONS.map((dest) => {
                const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.key === dest.difficulty);
                const isSelected = selectedDestination?.id === dest.id;
                
                return (
                  <TouchableOpacity
                    key={dest.id}
                    style={[
                      styles.destinationCard,
                      isSelected && styles.destinationCardSelected,
                    ]}
                    onPress={() => handleSelectDestination(dest)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.destinationHeader}>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: difficultyLevel?.color + '20' }
                      ]}>
                        <Icon 
                          name={difficultyLevel?.icon || 'walk'} 
                          size={14} 
                          color={difficultyLevel?.color} 
                        />
                      </View>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.destinationName}>{dest.name}</Text>
                    <Text style={styles.destinationRegion}>{dest.region}</Text>
                    <View style={styles.destinationStats}>
                      <View style={styles.destinationStat}>
                        <Icon name="walk-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.destinationStatText}>{dest.distance} km</Text>
                      </View>
                      <View style={styles.destinationStat}>
                        <Icon name="trending-up-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.destinationStatText}>{dest.elevation}m</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}
        
        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Legg inn turdetaljer</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Turnavn *</Text>
              <TextInput
                style={styles.input}
                placeholder="F.eks. Fjelltur til Gausta"
                placeholderTextColor={theme.colors.textTertiary}
                value={tripName}
                onChangeText={setTripName}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Distanse (km)</Text>
                <TextInput
                  style={[
                    styles.input,
                    parseFloat(distance) > TRIP_LIMITS.WARNING_DISTANCE_KM && styles.inputWarning,
                    parseFloat(distance) > TRIP_LIMITS.MAX_DISTANCE_KM && styles.inputError,
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                />
                {parseFloat(distance) > TRIP_LIMITS.MAX_DISTANCE_KM && (
                  <Text style={styles.limitWarning}>Maks {TRIP_LIMITS.MAX_DISTANCE_KM} km</Text>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.md }]}>
                <Text style={styles.inputLabel}>Høydemeter</Text>
                <TextInput
                  style={[
                    styles.input,
                    parseFloat(elevationGain) > TRIP_LIMITS.WARNING_ELEVATION_M && styles.inputWarning,
                    parseFloat(elevationGain) > TRIP_LIMITS.MAX_ELEVATION_M && styles.inputError,
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={elevationGain}
                  onChangeText={setElevationGain}
                  keyboardType="numeric"
                />
                {parseFloat(elevationGain) > TRIP_LIMITS.MAX_ELEVATION_M && (
                  <Text style={styles.limitWarning}>Maks {TRIP_LIMITS.MAX_ELEVATION_M} m</Text>
                )}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Varighet</Text>
              <TextInput
                style={styles.input}
                placeholder="F.eks. 4 timer, 2 dager"
                placeholderTextColor={theme.colors.textTertiary}
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </Animated.View>
        )}
        
        {/* Selected Destination / Trip Details */}
        {(selectedDestination || (activeTab === 'manual' && tripName)) && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Turdetaljer</Text>
            
            {/* Trip name */}
            {activeTab !== 'manual' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Turnavn</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Gi turen et navn"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={tripName}
                  onChangeText={setTripName}
                />
              </View>
            )}
            
            {/* Distance and elevation for non-manual */}
            {activeTab !== 'manual' && (
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Distanse (km)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      parseFloat(distance) > TRIP_LIMITS.WARNING_DISTANCE_KM && styles.inputWarning,
                      parseFloat(distance) > TRIP_LIMITS.MAX_DISTANCE_KM && styles.inputError,
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="numeric"
                  />
                  {parseFloat(distance) > TRIP_LIMITS.MAX_DISTANCE_KM && (
                    <Text style={styles.limitWarning}>Maks {TRIP_LIMITS.MAX_DISTANCE_KM} km</Text>
                  )}
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.md }]}>
                  <Text style={styles.inputLabel}>Høydemeter</Text>
                  <TextInput
                    style={[
                      styles.input,
                      parseFloat(elevationGain) > TRIP_LIMITS.WARNING_ELEVATION_M && styles.inputWarning,
                      parseFloat(elevationGain) > TRIP_LIMITS.MAX_ELEVATION_M && styles.inputError,
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={elevationGain}
                    onChangeText={setElevationGain}
                    keyboardType="numeric"
                  />
                  {parseFloat(elevationGain) > TRIP_LIMITS.MAX_ELEVATION_M && (
                    <Text style={styles.limitWarning}>Maks {TRIP_LIMITS.MAX_ELEVATION_M} m</Text>
                  )}
                </View>
              </View>
            )}
            
            {/* Difficulty Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vanskelighetsgrad</Text>
              <View style={styles.difficultyGrid}>
                {DIFFICULTY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.key}
                    style={[
                      styles.difficultyOption,
                      difficulty === level.key && styles.difficultyOptionSelected,
                      { borderColor: level.color + '40' },
                      difficulty === level.key && { backgroundColor: level.color + '20', borderColor: level.color },
                    ]}
                    onPress={() => setDifficulty(level.key)}
                  >
                    <Icon 
                      name={level.icon} 
                      size={20} 
                      color={difficulty === level.key ? level.color : theme.colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.difficultyLabel,
                        difficulty === level.key && { color: level.color },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Weather Section */}
            {weather && (
              <View style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <Icon name="partly-sunny-outline" size={20} color={theme.colors.info} />
                  <Text style={styles.weatherTitle}>Værmelding</Text>
                </View>
                <View style={styles.weatherContent}>
                  <View style={styles.weatherMain}>
                    <Icon 
                      name={getWeatherIcon(weather?.next_1_hours?.summary?.symbol_code)} 
                      size={48} 
                      color={getWeatherColor(weather?.next_1_hours?.summary?.symbol_code)} 
                    />
                    <Text style={styles.weatherTemp}>
                      {Math.round(weather?.instant?.details?.air_temperature || 0)}°C
                    </Text>
                  </View>
                  <View style={styles.weatherDetails}>
                    <View style={styles.weatherDetail}>
                      <Icon name="water-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.weatherDetailText}>
                        {Math.round(weather?.instant?.details?.relative_humidity || 0)}%
                      </Text>
                    </View>
                    <View style={styles.weatherDetail}>
                      <Icon name="speedometer-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.weatherDetailText}>
                        {Math.round(weather?.instant?.details?.wind_speed || 0)} m/s
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.weatherCredit}>Værdata fra MET.no (Yr)</Text>
              </View>
            )}
            
            {weatherLoading && (
              <View style={styles.weatherLoading}>
                <ActivityIndicator size="small" color={theme.colors.info} />
                <Text style={styles.weatherLoadingText}>Henter værdata...</Text>
              </View>
            )}
            
            {/* Weather Condition (for XP bonus) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Værforhold under turen</Text>
              <View style={styles.weatherConditions}>
                {[
                  { key: 'sunny', label: 'Sol', icon: 'sunny' },
                  { key: 'cloudy', label: 'Overskyet', icon: 'cloudy' },
                  { key: 'rain', label: 'Regn', icon: 'rainy' },
                  { key: 'snow', label: 'Snø', icon: 'snow' },
                ].map((condition) => (
                  <TouchableOpacity
                    key={condition.key}
                    style={[
                      styles.weatherCondition,
                      weatherCondition === condition.key && styles.weatherConditionSelected,
                    ]}
                    onPress={() => setWeatherCondition(condition.key)}
                  >
                    <Icon 
                      name={condition.icon} 
                      size={24} 
                      color={weatherCondition === condition.key ? theme.colors.info : theme.colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.weatherConditionLabel,
                        weatherCondition === condition.key && { color: theme.colors.info },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {condition.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notater (valgfritt)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beskrivelse, høydepunkter, utfordringer..."
                placeholderTextColor={theme.colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* XP Preview */}
            <XPPreview trip={currentTrip} />
          </Animated.View>
        )}
        
        {/* Action Buttons */}
        {(selectedDestination || (activeTab === 'manual' && tripName)) && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.saveRouteButton}
              onPress={handleSaveAsRoute}
              disabled={saving}
            >
              <Icon name="bookmark-outline" size={20} color={theme.colors.text} />
              <Text style={styles.saveRouteButtonText}>Lagre som planlagt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveTripButton}
              onPress={handleSaveTrip}
              disabled={saving}
            >
              <LinearGradient
                colors={[theme.colors.success, '#22C55E']}
                style={styles.saveTripGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <>
                    <Icon name="checkmark-circle" size={24} color={theme.colors.white} />
                    <Text style={styles.saveTripButtonText}>Fullfør tur & få XP</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* XP Celebration Overlay */}
      <XPCelebration
        visible={showXPCelebration}
        xpAmount={celebrationXP}
        onComplete={handleCelebrationComplete}
        celebrationType={celebrationXP >= 200 ? 'epic' : celebrationXP >= 100 ? 'big' : 'normal'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  header: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  headerGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '15',
  },
  tabText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.success,
  },
  section: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  searchResults: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  searchResultRegion: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  noResults: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  noResultsText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  noResultsSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  destinationCard: {
    width: isWeb ? 'calc(50% - 8px)' : (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  destinationCardSelected: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  difficultyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  destinationName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  destinationRegion: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  destinationStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  destinationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destinationStatText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  inputWarning: {
    borderColor: theme.colors.warning,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
    backgroundColor: theme.colors.error + '10',
  },
  limitWarning: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    minHeight: 80,
  },
  difficultyOptionSelected: {
    borderWidth: 2,
  },
  difficultyLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  weatherTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  weatherTemp: {
    ...theme.typography.h1,
    fontSize: 36,
    color: theme.colors.text,
  },
  weatherDetails: {
    gap: theme.spacing.xs,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  weatherDetailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  weatherCredit: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'right',
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  weatherLoadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  weatherConditions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  weatherCondition: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
  },
  weatherConditionSelected: {
    borderColor: theme.colors.info,
    backgroundColor: theme.colors.info + '15',
  },
  weatherConditionLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  xpPreview: {
    marginTop: theme.spacing.md,
  },
  xpPreviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  xpPreviewContent: {
    flex: 1,
  },
  xpPreviewTitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.9,
  },
  xpPreviewValue: {
    ...theme.typography.h2,
    fontSize: 28,
    color: theme.colors.white,
    fontWeight: '800',
  },
  xpBreakdown: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  xpBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  xpBreakdownIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBreakdownText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  xpBreakdownValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  xpBreakdownDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  xpCappedNote: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.7,
    fontSize: 11,
  },
  motivationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.success + '15',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  motivationNoteText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  saveRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveRouteButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveTripButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  saveTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  saveTripButtonText: {
    ...theme.typography.button,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.white,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  elevationChart: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    height: 150,
  },
  elevationYAxis: {
    position: 'absolute',
    left: theme.spacing.sm,
    top: theme.spacing.md,
    bottom: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  elevationBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.md,
    gap: 2,
  },
  elevationBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  elevationBar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  elevationXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.md,
  },
  elevationLabel: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
});


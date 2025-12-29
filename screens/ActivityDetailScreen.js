import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
  Animated,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Calendar from 'expo-calendar';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useRegistrations } from '../hooks/useRegistrations';
import { useActivityStats } from '../hooks/useActivityStats';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Generate smart description based on activity type
const generateDescription = (activity) => {
  if (activity.description && activity.description.length > 50) {
    return activity.description;
  }
  
  const type = activity.type || 'Aktivitet';
  const title = activity.title || '';
  const location = activity.location || '';
  
  const descriptions = {
    'Tur': [
      "Bli med på en flott tur i naturskjønne omgivelser! Dette er en ypperlig mulighet til å oppleve norsk natur sammen med andre medvandrere. Ta med passende bekledning og godt humør.",
      "En herlig turopplevelse venter! Vi utforsker naturen sammen og skaper gode minner underveis. Turen passer for alle som liker å gå i naturen.",
    ],
    'Motivasjonstur': [
      "En inspirerende helgetur som gir nye impulser og motivasjon! Vi kombinerer naturopplevelser med personlig utvikling og fellesskap i trygge rammer.",
      "Ladepause for kropp og sinn! Denne turen gir deg mulighet til å koble av fra hverdagen, oppleve naturen og bygge relasjoner med andre medvandrere.",
    ],
    'Møte': [
      "Viktig møte for medlemmer og interesserte. Her diskuterer vi aktuelle saker og planlegger kommende aktiviteter. Din stemme er viktig!",
    ],
    'Arrangement': [
      "Et spennende arrangement som bringer oss sammen! Opplev fellesskap, aktiviteter og nye bekjentskaper i trivelige omgivelser.",
    ],
    'Kurs': [
      "Lær noe nytt og utvikl deg! Dette kurset gir deg verdifull kunnskap og praktiske ferdigheter du kan bruke videre.",
    ],
    'Konferanse': [
      "En faglig samling med interessante foredrag og mulighet for nettverksbygging. Møt likesinnede og bli inspirert!",
    ],
    'Sosial': [
      "En hyggelig sosial samling der vi kobler av og bygger vennskap! Ta med godt humør og nyt fellesskapet.",
    ],
  };
  
  const typeDescriptions = descriptions[type] || [
    "En flott aktivitet arrangert av Medvandrerne! Vi inviterer deg til å være med på en opplevelse som gir muligheter for vekst, mestring og fellesskap."
  ];
  
  const index = Math.abs(title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % typeDescriptions.length;
  let description = typeDescriptions[index];
  
  if (location && location !== 'Har ikke sted' && location !== 'Ikke oppgitt') {
    description += `\n\nVi møtes ved ${location}.`;
  }
  
  return description;
};

// Get activity type color
const getActivityTypeColor = (type) => {
  switch (type) {
    case 'Tur':
      return theme.colors.success;
    case 'Motivasjonstur':
      return theme.colors.primary;
    case 'Møte':
      return theme.colors.info;
    case 'Arrangement':
      return theme.colors.warning;
    case 'Kurs':
      return '#9B59B6';
    case 'Konferanse':
      return '#3498DB';
    case 'Sosial':
      return '#E91E63';
    default:
      return theme.colors.textSecondary;
  }
};

export default function ActivityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params || {};
  const { isRegistered, registerForActivity, unregisterFromActivity, getRegistrationCount, fetchRegistrationData } = useRegistrations();
  const { completeActivity, uncompleteActivity, isActivityCompleted } = useActivityStats();
  const [isRegisteredState, setIsRegisteredState] = useState(false);
  const [isCompletedState, setIsCompletedState] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(activity?.registrationCount || 0);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (activity) {
      setIsRegisteredState(isRegistered(activity.id));
      setIsCompletedState(isActivityCompleted(activity.id));
      
      // Fetch latest registration count
      if (getRegistrationCount) {
        const count = getRegistrationCount(activity.id);
        if (count > 0) {
          setRegistrationCount(count);
        }
      }
    }
  }, [activity, isRegistered, isActivityCompleted, getRegistrationCount]);

  // Update header with registration indicator
  useFocusEffect(
    useCallback(() => {
      if (activity) {
        const registered = isRegistered(activity.id);
        setIsRegisteredState(registered);
        
        navigation.setOptions({
          headerRight: () => (
            registered ? (
              <View style={styles.headerIndicator}>
                <View style={styles.headerIndicatorBadge}>
                  <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
                </View>
              </View>
            ) : null
          ),
        });
      }
      
      return () => {
        navigation.setOptions({
          headerRight: undefined,
        });
      };
    }, [activity, isRegistered, navigation])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const headerStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const contentStyle = {
    opacity: fadeAnim,
  };

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen aktivitet valgt</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Tur':
        return 'walk';
      case 'Motivasjonstur':
        return 'map';
      case 'Møte':
        return 'people';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar';
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
      >
        {/* Hero Header - Full Width */}
        <Animated.View style={[styles.heroWrapper, headerStyle]}>
          <View style={styles.heroImageContainer}>
            <Image 
              source={require('../assets/img/hero/hero3.jpg')} 
              style={styles.heroBackgroundImage}
              resizeMode="cover"
            />
          <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
              style={styles.heroImageOverlay}
            />
            <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Icon
                name={getActivityIcon(activity.type)}
                  size={32}
                color={theme.colors.white}
              />
            </View>
            <Text style={styles.heroTitle}>{activity.title}</Text>
              {activity.location && activity.location !== 'Har ikke sted' && (
            <View style={styles.heroBadge}>
                  <Icon name="location" size={14} color={theme.colors.white} />
                  <Text style={styles.heroBadgeText}>{activity.location}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <View style={styles.detailsSection}>
            <TouchableOpacity
              style={styles.detailCard}
              onPress={async () => {
                if (isWeb) {
                  // Fallback for web - use Google Calendar URL
                  const startDate = new Date(activity.date);
                  if (activity.time && !activity.multiDay) {
                    const timeMatch = activity.time.match(/(\d{1,2}):(\d{2})/);
                    if (timeMatch) {
                      startDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                    }
                  }
                  const endDate = activity.multiDay ? new Date(activity.endDate) : new Date(startDate);
                  if (!activity.multiDay) {
                    endDate.setHours(startDate.getHours() + 2);
                  }
                  
                  const formatCalendarDate = (date) => {
                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                  };
                  
                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity.title)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}${activity.location && activity.location !== 'Har ikke sted' ? `&location=${encodeURIComponent(activity.location)}` : ''}&details=${encodeURIComponent(activity.description || '')}`;
                  await WebBrowser.openBrowserAsync(calendarUrl);
                  return;
                }

                try {
                  // Request calendar permissions
                  const { status } = await Calendar.requestCalendarPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert(
                      'Tilgang nødvendig',
                      'Vi trenger tilgang til kalenderen for å legge til hendelsen.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }

                  // Get default calendar
                  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                  const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
                  
                  if (!defaultCalendar) {
                    Alert.alert('Feil', 'Ingen kalender funnet');
                    return;
                  }

                  // Create start and end dates
                  const startDate = new Date(activity.date);
                  if (activity.time && !activity.multiDay) {
                    const timeMatch = activity.time.match(/(\d{1,2}):(\d{2})/);
                    if (timeMatch) {
                      startDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                    }
                  } else {
                    startDate.setHours(10, 0, 0, 0); // Default to 10:00
                  }

                  const endDate = activity.multiDay ? new Date(activity.endDate) : new Date(startDate);
                  if (activity.multiDay) {
                    endDate.setHours(18, 0, 0, 0); // End of day for multi-day events
                  } else if (activity.time && activity.time.includes('-')) {
                    // Parse time range like "11:00-12:00"
                    const timeRange = activity.time.split('-');
                    if (timeRange.length === 2) {
                      const endTimeMatch = timeRange[1].trim().match(/(\d{1,2}):(\d{2})/);
                      if (endTimeMatch) {
                        endDate.setHours(parseInt(endTimeMatch[1]), parseInt(endTimeMatch[2]), 0, 0);
                      }
                    } else {
                      endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration
                    }
                  } else {
                    endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration
                  }

                  // Create calendar event
                  const eventDetails = {
                    title: activity.title,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    notes: activity.description || '',
                    calendarId: defaultCalendar.id,
                  };

                  if (activity.location && activity.location !== 'Har ikke sted') {
                    eventDetails.location = activity.location;
                  }

                  await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
                  
                  Alert.alert(
                    'Suksess',
                    'Hendelsen er lagt til i kalenderen',
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  console.error('Error adding event to calendar:', error);
                  Alert.alert(
                    'Feil',
                    'Kunne ikke legge til hendelsen i kalenderen. Prøv igjen.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Icon name="time" size={28} color={theme.colors.info} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tidspunkt</Text>
                <Text style={styles.detailValue}>
                  {activity.multiDay
                    ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                    : `${formatDate(activity.date)}, kl. ${activity.time}`}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            {activity.location !== 'Har ikke sted' && (
              <TouchableOpacity
                style={styles.detailCard}
                onPress={() => {
                  // Open location in maps
                  const encodedLocation = encodeURIComponent(activity.location);
                  const url = Platform.select({
                    ios: `maps://maps.apple.com/?q=${encodedLocation}`,
                    android: `geo:0,0?q=${encodedLocation}`,
                    default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
                  });
                  Linking.openURL(url).catch(err => {
                    // Fallback to web maps
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`);
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.detailIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="location" size={28} color={theme.colors.success} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Sted</Text>
                  <Text style={styles.detailValue}>{activity.location}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Two Column Layout for Web */}
          <View style={styles.columnsContainer}>
            <View style={styles.columnSection}>
          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: getActivityTypeColor(activity.type) + '20' }]}>
                <Icon name="information-circle" size={24} color={getActivityTypeColor(activity.type)} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Om aktiviteten</Text>
                {activity.type && (
                  <View style={[styles.typeBadge, { backgroundColor: getActivityTypeColor(activity.type) + '20' }]}>
                    <Text style={[styles.typeBadgeText, { color: getActivityTypeColor(activity.type) }]}>
                      {activity.type}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.descriptionText}>
              {generateDescription(activity)}
            </Text>
            
            {/* Practical info section */}
            <View style={styles.practicalInfoSection}>
              <Text style={styles.practicalInfoTitle}>Praktisk informasjon</Text>
              <View style={styles.practicalInfoList}>
                <View style={styles.practicalInfoItem}>
                  <Icon name="shirt-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.practicalInfoText}>Ta med passende bekledning etter vær og årstid</Text>
                </View>
                <View style={styles.practicalInfoItem}>
                  <Icon name="restaurant-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.practicalInfoText}>Husk å ta med niste og drikke</Text>
                </View>
                {activity.multiDay && (
                  <View style={styles.practicalInfoItem}>
                    <Icon name="bed-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.practicalInfoText}>Overnatting inkludert i flerdagers arrangement</Text>
                  </View>
                )}
              </View>
            </View>
              </View>
            </View>

            <View style={styles.columnSection}>
              {/* Social Registration Section */}
              <View style={styles.registrationSection}>
                {/* Registration Stats */}
                <View style={styles.registrationStats}>
                  <View style={styles.statItem}>
                    <Icon name={isRegisteredState ? "checkmark-circle" : "people"} size={20} color={isRegisteredState ? theme.colors.success : theme.colors.primary} />
                    <Text style={[styles.statText, isRegisteredState && { color: theme.colors.success }]}>
                      {isRegisteredState ? 'Du er påmeldt!' : 'Bli med på aktiviteten'}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="people" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.statNumber}>{registrationCount}</Text>
                    <Text style={styles.statLabel}>påmeldt{registrationCount !== 1 ? 'e' : ''}</Text>
                  </View>
          </View>

                {/* Registration Button - Social Style */}
          <TouchableOpacity
                  style={styles.socialRegistrationButton}
            activeOpacity={0.85}
                onPress={async () => {
                  setIsLoading(true);
                  try {
                    if (isRegisteredState) {
                      const result = await unregisterFromActivity(activity.id);
                      setIsRegisteredState(false);
                      setRegistrationCount(prev => Math.max(0, prev - 1));
                      // Update header
                      navigation.setOptions({
                        headerRight: () => null,
                      });
                      Alert.alert(
                        'Avmeldt',
                        'Du er nå avmeldt fra aktiviteten',
                        [{ text: 'OK' }]
                      );
                    } else {
                      const result = await registerForActivity(activity);
                      setIsRegisteredState(true);
                      setRegistrationCount(prev => prev + 1);
                      // Update header
                      navigation.setOptions({
                        headerRight: () => (
                          <View style={styles.headerIndicator}>
                            <View style={styles.headerIndicatorBadge}>
                              <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
                            </View>
                          </View>
                        ),
                      });
                      Alert.alert(
                        'Påmeldt! 🎉',
                        'Du er nå påmeldt på aktiviteten! Du får en påminnelse før aktiviteten starter.',
                        [{ text: 'Flott!' }]
                      );
                    }
                  } catch (error) {
                    console.error('Registration error:', error);
                    Alert.alert(
                      'Feil',
                      'Kunne ikke oppdatere påmeldingen. Prøv igjen.',
                      [{ text: 'OK' }]
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }}
          >
            <LinearGradient
                    colors={isRegisteredState 
                      ? [theme.colors.success, '#4AE85C']
                      : [theme.colors.primary, theme.colors.primaryLight]
                    }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
                    style={styles.socialRegistrationGradient}
                  >
                    <View style={styles.socialRegistrationIcon}>
                      <Icon 
                        name={isRegisteredState ? "checkmark-circle" : "person-add"} 
                        size={32} 
                        color={theme.colors.white} 
                      />
                    </View>
                    <View style={styles.socialRegistrationContent}>
                      <Text style={styles.socialRegistrationTitle}>
                        {isRegisteredState ? 'Du er påmeldt!' : 'Meld deg på'}
                      </Text>
                      <Text style={styles.socialRegistrationSubtitle}>
                        {isRegisteredState 
                          ? 'Trykk for å melde deg av' 
                          : 'Bli med på denne aktiviteten'}
                      </Text>
                    </View>
                    {isRegisteredState && (
                      <View style={styles.socialRegistrationBadge}>
                        <Icon name="checkmark-circle" size={24} color={theme.colors.white} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Secondary Actions */}
                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    activeOpacity={0.7}
                    onPress={async () => {
                      const startDate = new Date(activity.date);
                      if (activity.time && !activity.multiDay) {
                        const [hours, minutes] = activity.time.split(':');
                        startDate.setHours(parseInt(hours), parseInt(minutes));
                      }
                      const endDate = activity.multiDay ? new Date(activity.endDate) : new Date(startDate);
                      if (!activity.multiDay) {
                        endDate.setHours(startDate.getHours() + 2);
                      }
                      
                      const formatCalendarDate = (date) => {
                        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      };
                      
                      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity.title)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}${activity.location && activity.location !== 'Har ikke sted' ? `&location=${encodeURIComponent(activity.location)}` : ''}&details=${encodeURIComponent(activity.description || '')}`;
                      await WebBrowser.openBrowserAsync(calendarUrl);
                    }}
                  >
                    <Icon name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.secondaryActionText}>Kalender</Text>
                  </TouchableOpacity>
                  
                  {activity.location && activity.location !== 'Har ikke sted' && (
                    <TouchableOpacity
                      style={styles.secondaryActionButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        const encodedLocation = encodeURIComponent(activity.location);
                        const url = Platform.select({
                          ios: `maps://maps.apple.com/?q=${encodedLocation}`,
                          android: `geo:0,0?q=${encodedLocation}`,
                          default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
                        });
                        Linking.openURL(url).catch(err => {
                          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`);
                        });
                      }}
                    >
                      <Icon name="location-outline" size={18} color={theme.colors.textSecondary} />
                      <Text style={styles.secondaryActionText}>Kart</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Messages Section - Only visible when registered */}
                {isRegisteredState && (
                  <TouchableOpacity
                    style={styles.messagesButton}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ActivityMessages', { activity })}
                  >
                    <View style={styles.messagesButtonIcon}>
                      <Icon name="chatbubbles" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.messagesButtonContent}>
                      <Text style={styles.messagesButtonTitle}>Meldinger fra arrangør</Text>
                      <Text style={styles.messagesButtonSubtitle}>Se oppdateringer og viktig info</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Hero Section - Full Width
  heroWrapper: {
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  heroMapContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroMapImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
  },
  heroMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    zIndex: 2,
  },
  heroGradient: {
    width: '100%',
    paddingVertical: theme.spacing.xl + theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    zIndex: 3,
  },
  heroTitle: {
    ...theme.typography.h2,
    fontSize: isWeb ? 24 : 22,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: theme.spacing.md,
  },
  heroBadge: {
    backgroundColor: theme.colors.white + '30',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  heroBadgeText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  
  // Content Section
  contentSection: {
    paddingHorizontal: isWeb ? theme.web.sidePadding : theme.spacing.lg,
  },
  detailsSection: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  detailCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
    alignItems: 'center',
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    lineHeight: 26,
  },
  
  // Columns Container
  columnsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
  },
  columnSection: {
    flex: isWeb ? 1 : undefined,
  },
  // Description Section
  descriptionSection: {
    marginBottom: isWeb ? 0 : theme.spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.md,
  },
  typeBadgeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
  },
  practicalInfoSection: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  practicalInfoTitle: {
    ...theme.typography.h4,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  practicalInfoList: {
    gap: theme.spacing.md,
  },
  practicalInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  practicalInfoText: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  
  // Social Registration Section
  registrationSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.medium,
  },
  registrationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderLight,
  },
  statNumber: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginRight: theme.spacing.xs / 2,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  socialRegistrationButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
    ...theme.shadows.glow,
  },
  socialRegistrationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  socialRegistrationIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialRegistrationContent: {
    flex: 1,
  },
  socialRegistrationTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  socialRegistrationSubtitle: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    color: theme.colors.white,
    opacity: 0.9,
  },
  socialRegistrationBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  secondaryActionText: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  
  // Messages Button
  messagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
  },
  messagesButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesButtonContent: {
    flex: 1,
  },
  messagesButtonTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  messagesButtonSubtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  // Header Indicator
  headerIndicator: {
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIndicatorBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.success + '40',
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

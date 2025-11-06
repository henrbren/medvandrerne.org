import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Calendar from 'expo-calendar';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useRegistrations } from '../hooks/useRegistrations';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function ActivityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params || {};
  const { isRegistered, registerForActivity, unregisterFromActivity } = useRegistrations();
  const [isRegisteredState, setIsRegisteredState] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (activity) {
      setIsRegisteredState(isRegistered(activity.id));
    }
  }, [activity, isRegistered]);

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
                  <Icon name="information-circle" size={28} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Om aktiviteten</Text>
                </View>
                <Text style={styles.descriptionText}>
                  {activity.description || 
                    'Dette er en spennende aktivitet arrangert av Medvandrerne. ' +
                    'Vi inviterer deg til å være med på en opplevelse som gir muligheter ' +
                    'for vekst, mestring og fellesskap i naturen.'}
                </Text>
              </View>
            </View>

            <View style={styles.columnSection}>
              {/* Registration Button */}
              <TouchableOpacity
                style={styles.actionCTA}
                activeOpacity={0.85}
                onPress={async () => {
                  if (isRegisteredState) {
                    await unregisterFromActivity(activity.id);
                    setIsRegisteredState(false);
                    Alert.alert(
                      'Avmeldt',
                      'Du er nå avmeldt fra aktiviteten',
                      [{ text: 'OK' }]
                    );
                  } else {
                    await registerForActivity(activity);
                    setIsRegisteredState(true);
                    Alert.alert(
                      'Påmeldt',
                      'Du er nå påmeldt på aktiviteten!',
                      [{ text: 'OK' }]
                    );
                  }
                }}
              >
                <LinearGradient
                  colors={isRegisteredState 
                    ? [theme.colors.textSecondary, theme.colors.textTertiary]
                    : [theme.colors.primary, theme.colors.primaryLight]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCTAGradient}
                >
                  <View style={styles.ctaIconContainer}>
                    <Icon 
                      name={isRegisteredState ? "checkmark-circle" : "person-add"} 
                      size={28} 
                      color={theme.colors.white} 
                    />
                  </View>
                  <Text style={styles.ctaText}>
                    {isRegisteredState ? 'Påmeldt' : 'Meld deg på'}
                  </Text>
                  {!isRegisteredState && (
                    <Icon name="arrow-forward" size={24} color={theme.colors.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Calendar Button */}
              <TouchableOpacity
                style={styles.secondaryCTA}
                activeOpacity={0.85}
                onPress={async () => {
                  // Create calendar event URL
                  const startDate = new Date(activity.date);
                  if (activity.time && !activity.multiDay) {
                    const [hours, minutes] = activity.time.split(':');
                    startDate.setHours(parseInt(hours), parseInt(minutes));
                  }
                  const endDate = activity.multiDay ? new Date(activity.endDate) : new Date(startDate);
                  if (!activity.multiDay) {
                    endDate.setHours(startDate.getHours() + 2); // Default 2 hour duration
                  }
                  
                  const formatCalendarDate = (date) => {
                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                  };
                  
                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity.title)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}${activity.location && activity.location !== 'Har ikke sted' ? `&location=${encodeURIComponent(activity.location)}` : ''}&details=${encodeURIComponent(activity.description || '')}`;
                  await WebBrowser.openBrowserAsync(calendarUrl);
                }}
              >
                <View style={styles.secondaryCTAContent}>
                  <Icon name="calendar" size={20} color={theme.colors.primary} />
                  <Text style={styles.secondaryCTAText}>Legg til i kalender</Text>
                </View>
              </TouchableOpacity>
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
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 28,
  },
  
  // Action CTA
  actionCTA: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
    marginBottom: theme.spacing.xl,
  },
  actionCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    flex: 1,
  },
  secondaryCTA: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  secondaryCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  secondaryCTAText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
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

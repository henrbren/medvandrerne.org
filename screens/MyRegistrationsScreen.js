import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';
import { useRegistrations } from '../hooks/useRegistrations';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

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

// Check if activity is upcoming or past
const isUpcoming = (activity) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDate = new Date(activity.endDate || activity.date);
  return activityDate >= today;
};

// Days until activity
const getDaysUntil = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'I dag';
  if (diffDays === 1) return 'I morgen';
  if (diffDays < 0) return 'Utløpt';
  if (diffDays <= 7) return `${diffDays} dager`;
  return null;
};

export default function MyRegistrationsScreen() {
  const navigation = useNavigation();
  const { data, loading: dataLoading, refreshData } = useAppData();
  const { registrations, loading: regLoading, loadRegistrations, unregisterFromActivity } = useRegistrations();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userId, setUserId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Combine activities and calendar events
  const allActivities = [...(data.activities || []), ...(data.calendar || [])];

  // Get user ID
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('@medvandrerne_user_id');
      setUserId(id);
    };
    getUserId();
  }, []);

  // Fetch unread message counts
  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) return;
    
    const counts = {};
    for (const activityId of registrations) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/activity-messages/get.php?activityId=${activityId}&userId=${userId}`,
          { method: 'GET', headers: { 'Accept': 'application/json' } }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.unreadCount > 0) {
            counts[activityId] = result.unreadCount;
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }
    setUnreadCounts(counts);
  }, [registrations, userId]);

  // Refresh registrations when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
      fetchUnreadCounts();
    }, [fetchUnreadCounts])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get registered activities
  const registeredActivities = allActivities
    .filter(activity => {
      const activityId = String(activity.id);
      return registrations.includes(activityId) || registrations.includes(activity.id);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Split into upcoming and past
  const upcomingActivities = registeredActivities.filter(isUpcoming);
  const pastActivities = registeredActivities.filter(a => !isUpcoming(a));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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
      case 'Kurs':
        return 'school';
      case 'Konferanse':
        return 'business';
      case 'Sosial':
        return 'happy';
      default:
        return 'calendar';
    }
  };

  const handleUnregister = (activity) => {
    Alert.alert(
      'Avmeld aktivitet',
      `Er du sikker på at du vil avmelde deg fra "${activity.title}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Avmeld',
          style: 'destructive',
          onPress: async () => {
            await unregisterFromActivity(activity.id);
            Alert.alert('Avmeldt', 'Du er nå avmeldt fra aktiviteten');
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshData(), loadRegistrations()]);
    await fetchUnreadCounts();
    setRefreshing(false);
  };

  const loading = dataLoading || regLoading;

  // Navigate to activity detail - must be before any early returns!
  const handleActivityPress = useCallback((activity) => {
    console.log('Activity pressed:', activity?.title);
    console.log('Navigation available:', !!navigation);
    if (navigation) {
      navigation.navigate('ActivityDetail', { activity });
    }
  }, [navigation]);

  // Navigate to messages - must be before any early returns!
  const handleMessagesPress = useCallback((activity) => {
    console.log('Messages pressed:', activity?.title);
    if (navigation) {
      navigation.navigate('ActivityMessages', { activity });
    }
  }, [navigation]);

  if (loading && registeredActivities.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster påmeldinger...</Text>
      </View>
    );
  }

  // Render activity card
  const renderActivityCard = (activity, isPast = false) => {
    const typeColor = getActivityTypeColor(activity.type);
    const daysUntil = getDaysUntil(activity.date);
    const activityId = String(activity.id);
    const unreadCount = unreadCounts[activityId] || 0;
    
    return (
      <Pressable 
        key={activity.id} 
        style={({ pressed }) => [
          styles.activityCard, 
          isPast && styles.activityCardPast,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => handleActivityPress(activity)}
      >
        <View style={styles.activityCardContent}>
          <View style={styles.activityIconContainer}>
            <LinearGradient
              colors={isPast ? ['#9E9E9E', '#BDBDBD'] : [typeColor, typeColor + 'CC']}
              style={styles.activityIconGradient}
            >
              <Icon
                name={getActivityIcon(activity.type)}
                size={24}
                color={theme.colors.white}
              />
            </LinearGradient>
          </View>
          <View style={styles.activityContent}>
            <View style={styles.activityTitleRow}>
              <Text style={[styles.activityTitle, isPast && styles.activityTitlePast]} numberOfLines={1}>
                {activity.title}
              </Text>
              {daysUntil && !isPast && (
                <View style={[
                  styles.daysUntilBadge,
                  daysUntil === 'I dag' && styles.daysUntilToday,
                  daysUntil === 'I morgen' && styles.daysUntilTomorrow,
                ]}>
                  <Text style={[
                    styles.daysUntilText,
                    daysUntil === 'I dag' && styles.daysUntilTextToday,
                    daysUntil === 'I morgen' && styles.daysUntilTextTomorrow,
                  ]}>{daysUntil}</Text>
                </View>
              )}
            </View>
            <View style={styles.activityMeta}>
              <View style={[styles.activityBadge, { backgroundColor: typeColor + '20' }]}>
                <Text style={[styles.activityType, { color: typeColor }]}>{activity.type || 'Aktivitet'}</Text>
              </View>
              <Text style={styles.activityTime}>
                {activity.multiDay
                  ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                  : `${formatDate(activity.date)}${activity.time && activity.time !== 'Hele dagen' ? ` • ${activity.time.split('-')[0]}` : ''}`
                }
              </Text>
            </View>
            {activity.location && activity.location !== 'Har ikke sted' && activity.location !== 'Ikke oppgitt' && (
              <View style={styles.activityLocation}>
                <Icon name="location-outline" size={14} color={theme.colors.textTertiary} />
                <Text style={styles.activityLocationText} numberOfLines={1}>{activity.location}</Text>
              </View>
            )}
          </View>
          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </View>

        {/* Action Buttons */}
        {!isPast && (
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
              onPress={(e) => {
                e.stopPropagation();
                handleMessagesPress(activity);
              }}
            >
              <View style={styles.actionButtonContent}>
                <Icon name="chatbubbles-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Meldinger</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
              onPress={(e) => {
                e.stopPropagation();
                handleUnregister(activity);
              }}
            >
              <View style={styles.actionButtonContent}>
                <Icon name="close-circle-outline" size={18} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Avmeld</Text>
              </View>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroIconContainer}>
              <Icon name="checkmark-circle" size={40} color={theme.colors.white} />
            </View>
            <Text style={styles.heroTitle}>Mine påmeldinger</Text>
            <Text style={styles.heroSubtitle}>
              {upcomingActivities.length === 0
                ? 'Ingen kommende aktiviteter'
                : `${upcomingActivities.length} kommende ${upcomingActivities.length === 1 ? 'aktivitet' : 'aktiviteter'}`
              }
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Section */}
        {registeredActivities.length > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{upcomingActivities.length}</Text>
              <Text style={styles.statLabel}>Kommende</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="checkmark-done" size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>{pastActivities.length}</Text>
              <Text style={styles.statLabel}>Fullført</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="chatbubbles" size={24} color={theme.colors.info} />
              <Text style={styles.statValue}>{Object.values(unreadCounts).reduce((a, b) => a + b, 0)}</Text>
              <Text style={styles.statLabel}>Uleste</Text>
            </View>
          </View>
        )}

        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <Animated.View style={[styles.activitiesSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Kommende aktiviteter</Text>
            </View>
            <View style={styles.activitiesList}>
              {upcomingActivities.map((activity) => renderActivityCard(activity, false))}
            </View>
          </Animated.View>
        )}

        {/* Past Activities */}
        {pastActivities.length > 0 && (
          <Animated.View style={[styles.activitiesSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Icon name="checkmark-done" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                Tidligere aktiviteter
              </Text>
            </View>
            <View style={styles.activitiesList}>
              {pastActivities.slice(0, 5).map((activity) => renderActivityCard(activity, true))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {registeredActivities.length === 0 && (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <View style={styles.emptyIconContainer}>
              <Icon name="calendar-outline" size={80} color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Ingen påmeldinger</Text>
            <Text style={styles.emptyText}>
              Du er ikke påmeldt noen aktiviteter ennå.{'\n'}
              Gå til aktivitetskalenderen for å melde deg på.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Aktiviteter')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Icon name="calendar" size={24} color={theme.colors.white} />
                <Text style={styles.ctaText}>Se aktiviteter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
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
  
  // Hero Section
  heroSection: {
    marginBottom: theme.spacing.lg,
  },
  heroGradient: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    ...theme.typography.h2,
    fontSize: isWeb ? 28 : 24,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.95,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statValue: {
    ...theme.typography.h3,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  
  // Activities Section
  activitiesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  activitiesList: {
    gap: theme.spacing.md,
  },
  
  // Activity Card
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  activityCardPast: {
    opacity: 0.7,
  },
  activityCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  activityIconContainer: {
    ...theme.shadows.small,
  },
  activityIconGradient: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  activityTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  activityTitlePast: {
    color: theme.colors.textSecondary,
  },
  daysUntilBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.md,
  },
  daysUntilToday: {
    backgroundColor: theme.colors.error + '15',
  },
  daysUntilTomorrow: {
    backgroundColor: theme.colors.warning + '15',
  },
  daysUntilText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  daysUntilTextToday: {
    color: theme.colors.error,
  },
  daysUntilTextTomorrow: {
    color: theme.colors.warning,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  activityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activityTime: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  activityLocationText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: theme.colors.borderLight,
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.white,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  ctaText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

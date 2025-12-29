import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useTripPlanner, DIFFICULTY_LEVELS } from '../hooks/useTripPlanner';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Stats Card Component
const StatsCard = ({ icon, value, label, color, onPress }) => (
  <TouchableOpacity 
    style={styles.statCard} 
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
  >
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
  </TouchableOpacity>
);

// Trip Card Component
const TripCard = ({ trip, onDelete, onPress }) => {
  const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.key === trip.difficulty);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  return (
    <TouchableOpacity
      style={styles.tripCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.tripCardHeader}>
        <View style={styles.tripCardIcon}>
          <LinearGradient
            colors={[theme.colors.success, '#22C55E']}
            style={styles.tripCardIconGradient}
          >
            <Icon name="footsteps" size={20} color={theme.colors.white} />
          </LinearGradient>
        </View>
        <View style={styles.tripCardInfo}>
          <Text style={styles.tripCardTitle}>{trip.name || 'Tur'}</Text>
          <Text style={styles.tripCardDate}>{formatDate(trip.completedAt)}</Text>
        </View>
        <View style={styles.tripCardXP}>
          <Icon name="star" size={16} color={theme.colors.warning} />
          <Text style={styles.tripCardXPText}>+{trip.xpEarned}</Text>
        </View>
      </View>
      
      <View style={styles.tripCardStats}>
        {trip.distance > 0 && (
          <View style={styles.tripCardStat}>
            <Icon name="walk-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tripCardStatText}>{trip.distance} km</Text>
          </View>
        )}
        {trip.elevationGain > 0 && (
          <View style={styles.tripCardStat}>
            <Icon name="trending-up-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tripCardStatText}>{trip.elevationGain}m</Text>
          </View>
        )}
        {trip.duration && (
          <View style={styles.tripCardStat}>
            <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tripCardStatText}>{trip.duration}</Text>
          </View>
        )}
        {difficultyLevel && (
          <View style={[styles.tripCardDifficulty, { backgroundColor: difficultyLevel.color + '20' }]}>
            <Icon name={difficultyLevel.icon} size={14} color={difficultyLevel.color} />
            <Text style={[styles.tripCardDifficultyText, { color: difficultyLevel.color }]}>
              {difficultyLevel.label}
            </Text>
          </View>
        )}
      </View>
      
      {trip.notes && (
        <Text style={styles.tripCardNotes} numberOfLines={2}>
          {trip.notes}
        </Text>
      )}
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(trip.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Planned Route Card Component
const RouteCard = ({ route, onDelete, onStartTrip }) => {
  const difficultyLevel = DIFFICULTY_LEVELS.find(d => d.key === route.difficulty);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };
  
  return (
    <View style={styles.routeCard}>
      <View style={styles.routeCardHeader}>
        <View style={[styles.routeCardIcon, { backgroundColor: theme.colors.info + '20' }]}>
          <Icon name="bookmark" size={20} color={theme.colors.info} />
        </View>
        <View style={styles.routeCardInfo}>
          <Text style={styles.routeCardTitle}>{route.name || 'Planlagt tur'}</Text>
          <Text style={styles.routeCardDate}>Lagret {formatDate(route.createdAt)}</Text>
        </View>
      </View>
      
      <View style={styles.routeCardStats}>
        {route.distance > 0 && (
          <View style={styles.tripCardStat}>
            <Icon name="walk-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tripCardStatText}>{route.distance} km</Text>
          </View>
        )}
        {route.elevationGain > 0 && (
          <View style={styles.tripCardStat}>
            <Icon name="trending-up-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tripCardStatText}>{route.elevationGain}m</Text>
          </View>
        )}
        {difficultyLevel && (
          <View style={[styles.tripCardDifficulty, { backgroundColor: difficultyLevel.color + '20' }]}>
            <Icon name={difficultyLevel.icon} size={14} color={difficultyLevel.color} />
            <Text style={[styles.tripCardDifficultyText, { color: difficultyLevel.color }]}>
              {difficultyLevel.label}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.routeCardActions}>
        <TouchableOpacity
          style={styles.routeDeleteButton}
          onPress={() => onDelete(route.id)}
        >
          <Icon name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startTripButton}
          onPress={() => onStartTrip(route)}
        >
          <Icon name="play" size={16} color={theme.colors.success} />
          <Text style={styles.startTripButtonText}>Start tur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MyTripsScreen({ navigation }) {
  const { trips, savedRoutes, loading, deleteTrip, deleteRoute, getStats, loadData } = useTripPlanner();
  const [activeTab, setActiveTab] = useState('completed'); // completed, planned
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
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
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const handleDeleteTrip = (tripId) => {
    Alert.alert(
      'Slett tur',
      'Er du sikker på at du vil slette denne turen? XP vil ikke bli fjernet.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: () => deleteTrip(tripId),
        },
      ]
    );
  };
  
  const handleDeleteRoute = (routeId) => {
    Alert.alert(
      'Slett planlagt tur',
      'Er du sikker på at du vil slette denne planlagte turen?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: () => deleteRoute(routeId),
        },
      ]
    );
  };
  
  const handleStartTrip = (route) => {
    // Navigate to trip planner with pre-filled data
    navigation.navigate('TripPlanner', { prefillRoute: route });
  };
  
  const stats = getStats();
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laster turer...</Text>
        </View>
      </View>
    );
  }
  
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
            tintColor={theme.colors.success}
          />
        }
      >
        {/* Stats Header */}
        <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.statsGrid}>
            <StatsCard
              icon="footsteps"
              value={stats.totalTrips}
              label="Turer"
              color={theme.colors.success}
            />
            <StatsCard
              icon="walk"
              value={`${stats.totalDistance} km`}
              label="Totalt gått"
              color={theme.colors.info}
            />
            <StatsCard
              icon="trending-up"
              value={`${stats.totalElevation}m`}
              label="Høydemeter"
              color={theme.colors.warning}
            />
            <StatsCard
              icon="star"
              value={stats.totalXP}
              label="XP tjent"
              color={theme.colors.primary}
            />
          </View>
        </Animated.View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Icon 
              name="checkmark-circle-outline" 
              size={20} 
              color={activeTab === 'completed' ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Fullførte ({trips.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'planned' && styles.tabActive]}
            onPress={() => setActiveTab('planned')}
          >
            <Icon 
              name="bookmark-outline" 
              size={20} 
              color={activeTab === 'planned' ? theme.colors.info : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'planned' && styles.tabTextActive]}>
              Planlagte ({savedRoutes.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.contentSection}>
          {activeTab === 'completed' ? (
            trips.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Icon name="footsteps-outline" size={64} color={theme.colors.textTertiary} />
                </View>
                <Text style={styles.emptyStateTitle}>Ingen turer ennå</Text>
                <Text style={styles.emptyStateText}>
                  Planlegg og fullfør din første tur for å tjene XP!
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('TripPlanner')}
                >
                  <LinearGradient
                    colors={[theme.colors.success, '#22C55E']}
                    style={styles.emptyStateButtonGradient}
                  >
                    <Icon name="add" size={24} color={theme.colors.white} />
                    <Text style={styles.emptyStateButtonText}>Planlegg en tur</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsList}>
                {trips
                  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                  .map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onDelete={handleDeleteTrip}
                      onPress={() => {}} // Could expand to show details
                    />
                  ))
                }
              </View>
            )
          ) : (
            savedRoutes.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Icon name="bookmark-outline" size={64} color={theme.colors.textTertiary} />
                </View>
                <Text style={styles.emptyStateTitle}>Ingen planlagte turer</Text>
                <Text style={styles.emptyStateText}>
                  Lagre ruter du vil gå senere
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('TripPlanner')}
                >
                  <LinearGradient
                    colors={[theme.colors.info, '#0EA5E9']}
                    style={styles.emptyStateButtonGradient}
                  >
                    <Icon name="add" size={24} color={theme.colors.white} />
                    <Text style={styles.emptyStateButtonText}>Planlegg en tur</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsList}>
                {savedRoutes
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      onDelete={handleDeleteRoute}
                      onStartTrip={handleStartTrip}
                    />
                  ))
                }
              </View>
            )
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TripPlanner')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.success, '#22C55E']}
          style={styles.fabGradient}
        >
          <Icon name="add" size={28} color={theme.colors.white} />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: theme.spacing.xxxl + 80,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: isWeb ? 'calc(25% - 12px)' : (width - theme.spacing.lg * 2 - theme.spacing.md * 3) / 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...theme.shadows.small,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    ...theme.typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
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
  contentSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyStateButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyStateButtonText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  tripsList: {
    gap: theme.spacing.md,
  },
  tripCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    ...theme.shadows.small,
  },
  tripCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tripCardIcon: {
    marginRight: theme.spacing.md,
  },
  tripCardIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCardInfo: {
    flex: 1,
  },
  tripCardTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  tripCardDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  tripCardXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  tripCardXPText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  tripCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tripCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripCardStatText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tripCardDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tripCardDifficultyText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  tripCardNotes: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
    ...theme.shadows.small,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  routeCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  routeCardInfo: {
    flex: 1,
  },
  routeCardTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  routeCardDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  routeCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  routeCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  routeDeleteButton: {
    padding: theme.spacing.sm,
  },
  startTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.md,
  },
  startTripButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 1000,
    ...theme.shadows.large,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


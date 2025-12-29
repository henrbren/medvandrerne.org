import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Alert,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useRegistrations } from '../hooks/useRegistrations';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useSkills, SKILLS } from '../hooks/useSkills';
import { useGamification } from '../hooks/useGamification';
import { useTripPlanner } from '../hooks/useTripPlanner';
import { usePedometer } from '../hooks/usePedometer';
import { SAMPLE_ACTIVITIES } from '../constants/data';
import { getLevelColors, getLevelAnimationConfig, getLevelName, getAchievementMotivation } from '../utils/journeyUtils';
import XPCelebration, { QuickXPPopup } from '../components/XPCelebration';
import { useXPCelebration } from '../hooks/useXPCelebration';
import LevelBackground from '../components/LevelBackground';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function MyJourneyScreen({ navigation: navigationProp }) {
  const navigationHook = useNavigation();
  const navigation = navigationProp || navigationHook;
  const { registrations, loadRegistrations } = useRegistrations();
  const { stats: activityStats, loading: statsLoading, completeActivity, isActivityCompleted } = useActivityStats();
  const { entries, moments, getStats: getMasteryStats, loadData, addEntry, addMoment } = useMasteryLog();
  const { expeditions, environmentActions, getStats: getTrackingStats, loadData: loadTrackingData } = useActivityTracking();
  const { skills, completedSkills, toggleSkill, getStats: getSkillsStats, getTotalXPEarned, loadSkills } = useSkills();
  const { trips, getStats: getTripStats, loadData: loadTripData } = useTripPlanner();
  const { 
    isAvailable: pedometerAvailable,
    todaySteps,
    xpEarnedToday: pedometerXPToday,
    totalXPFromSteps: pedometerTotalXP,
    pendingXP: pedometerPendingXP,
    claimPendingXP,
    getStats: getPedometerStats,
    STEPS_PER_XP,
    MAX_XP_PER_DAY: MAX_PEDOMETER_XP_PER_DAY,
  } = usePedometer();
  
  // Modal states
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddType, setQuickAddType] = useState(null); // 'reflection', 'moment', 'skill'
  const [reflectionText, setReflectionText] = useState('');
  const [momentTitle, setMomentTitle] = useState('');
  const [momentCategory, setMomentCategory] = useState('physical');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  // Combine stats
  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();
  const tripStats = getTripStats();
  
  const combinedStats = useMemo(() => ({
    totalActivities: activityStats.totalActivities || 0,
    totalCompletedActivities: activityStats.totalCompletedActivities || 0,
    totalRegistrations: activityStats.totalRegistrations || 0,
    totalReflections: masteryStats.totalEntries || 0,
    totalMoments: masteryStats.totalMoments || 0,
    currentStreak: activityStats.currentStreak || 0,
    totalExpeditions: trackingStats.totalExpeditions || 0,
    totalEnvironmentActions: trackingStats.totalEnvironmentActions || 0,
    totalSkills: skillsStats.completedSkills || 0,
    skillsXP: skillsXP,
    totalTrips: tripStats.totalTrips || 0,
    totalTripDistance: tripStats.totalDistance || 0,
    totalTripElevation: tripStats.totalElevation || 0,
    tripsXP: tripStats.totalXP || 0,
    // Trip achievement stats
    motivationTrips: tripStats.motivationTrips || 0,
    rainTrips: tripStats.rainTrips || 0,
    snowTrips: tripStats.snowTrips || 0,
    hardTrips: tripStats.hardTrips || 0,
    expertTrips: tripStats.expertTrips || 0,
    longestTrip: tripStats.longestTrip || 0,
    highestElevationTrip: tripStats.highestElevationTrip || 0,
    // Pedometer stats
    pedometerXP: pedometerTotalXP || 0,
    todaySteps: todaySteps || 0,
  }), [activityStats, masteryStats, trackingStats, skillsStats, skillsXP, tripStats, pedometerTotalXP, todaySteps]);
  
  const {
    level,
    totalXP,
    xpProgress,
    unlockedAchievements,
    nextMilestones,
    recalculateXP,
    reloadData: reloadGamificationData,
    loading: gamificationLoading,
  } = useGamification(combinedStats);

  const {
    showCelebration,
    celebrationXP,
    celebrationType,
    levelUp: celebrationLevelUp,
    newLevel: celebrationNewLevel,
    quickPopup,
    onCelebrationComplete,
    dismissCelebration,
    triggerCelebration,
    resetCelebrationState,
  } = useXPCelebration(totalXP, level);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await Promise.all([
          loadRegistrations(),
          loadData(),
          loadTrackingData(),
          loadSkills(),
          loadTripData(),
        ]);
      };
      refreshData();
    }, [])
  );

  useEffect(() => {
    if (!hasAnimatedRef.current) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        hasAnimatedRef.current = true;
      });
    } else {
      fadeAnim.setValue(1);
    }
  }, []);

  // Quick add handlers
  const handleQuickAdd = (type) => {
    setQuickAddType(type);
    setShowQuickAddModal(true);
  };

  const handleSaveQuickAdd = async () => {
    let xpEarned = 0;
    
    if (quickAddType === 'reflection' && reflectionText.trim()) {
      await addEntry({ reflection: reflectionText.trim(), category: 'general' });
      setReflectionText('');
      xpEarned = 30;
    } else if (quickAddType === 'moment' && momentTitle.trim()) {
      await addMoment({ title: momentTitle.trim(), category: momentCategory });
      setMomentTitle('');
      xpEarned = 40;
    } else if (quickAddType === 'skill') {
      // Navigate to skills screen
      navigation.navigate('Skills');
    }
    
    setShowQuickAddModal(false);
    setQuickAddType(null);
    await loadData();
    
    // Trigger XP celebration if XP was earned (quick popup only)
    if (xpEarned > 0) {
      // Small delay to let the modal close first
      setTimeout(() => {
        triggerCelebration(xpEarned);
      }, 300);
    }
  };

  const handleToggleSkill = async (skillId) => {
    await toggleSkill(skillId);
    await loadSkills();
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const resetAllData = async () => {
    Alert.alert(
      'Nullstill alt',
      'Er du sikker på at du vil nullstille all data? Dette kan ikke angres.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Nullstill',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset celebration state first to prevent any celebrations during reset
              resetCelebrationState();
              
              // All storage keys that should be reset
              const keysToReset = [
                // Gamification & XP
                '@medvandrerne_gamification',
                '@medvandrerne_gamification_last_sync',
                
                // Skills
                '@medvandrerne_skills',
                
                // Mastery log & moments
                '@medvandrerne_mastery_log',
                '@medvandrerne_mastery_moments',
                
                // Activities & tracking
                '@medvandrerne_expeditions',
                '@medvandrerne_environment_actions',
                '@medvandrerne_activity_stats',
                '@medvandrerne_completed_activities',
                
                // Registrations
                '@medvandrerne_registrations',
                '@medvandrerne_registration_counts',
                
                // Trips
                '@medvandrerne_trips',
                '@medvandrerne_trip_routes',
                
                // Pedometer / steps
                '@medvandrerne_pedometer',
                '@medvandrerne_pedometer_history',
                
                // Contacts & favorites
                '@medvandrerne_contacts',
                '@medvandrerne_favorite_contacts',
                '@medvandrerne_favorite_groups',
                
                // Location sharing
                '@medvandrerne_location_sharing',
                
                // Invitations cache
                '@medvandrerne_invitations_cache',
              ];
              
              await Promise.all(
                keysToReset.map(key => AsyncStorage.removeItem(key))
              );
              
              await new Promise(resolve => setTimeout(resolve, 200));
              await Promise.all([
                loadRegistrations(),
                loadData(),
                loadTrackingData(),
                loadSkills(),
                loadTripData(),
              ]);
              await reloadGamificationData();
              hasAnimatedRef.current = false;
              Alert.alert('Suksess', 'All data har blitt nullstilt.');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Feil', 'Kunne ikke nullstille data.');
            }
          },
        },
      ]
    );
  };

  const levelColors = getLevelColors(level);
  const animConfig = getLevelAnimationConfig(level);

  // Daily quests - what can user do today for XP
  const dailyQuests = useMemo(() => {
    const quests = [];
    
    // Always available
    quests.push({
      id: 'reflection',
      title: 'Skriv en refleksjon',
      xp: 30,
      icon: 'book-outline',
      color: theme.colors.info,
      action: () => handleQuickAdd('reflection'),
    });
    
    quests.push({
      id: 'moment',
      title: 'Logg et mestringsmoment',
      xp: 40,
      icon: 'trophy-outline',
      color: theme.colors.warning,
      action: () => handleQuickAdd('moment'),
    });
    
    quests.push({
      id: 'trip',
      title: 'Gå en tur',
      xp: '50-300',
      icon: 'footsteps-outline',
      color: theme.colors.success,
      action: () => navigation.navigate('TripPlanner'),
    });
    
    if (skillsStats.completedSkills < SKILLS.length) {
      quests.push({
        id: 'skill',
        title: 'Lær en ny ferdighet',
        xp: '50-150',
        icon: 'star-outline',
        color: theme.colors.warning,
        action: () => navigation.navigate('Skills'),
      });
    }
    
    return quests;
  }, [skillsStats.completedSkills]);

  // Get next milestone (just one, the closest)
  const nextGoal = nextMilestones.length > 0 ? nextMilestones[0] : null;

  // Recent activity feed (combined, last 5)
  const recentActivity = useMemo(() => {
    const activities = [];
    
    entries.slice(0, 2).forEach(e => {
      activities.push({
        id: `ref-${e.id}`,
        type: 'reflection',
        title: e.reflection?.slice(0, 40) + (e.reflection?.length > 40 ? '...' : '') || 'Refleksjon',
        date: e.date,
        icon: 'book',
        color: theme.colors.info,
        xp: 30,
      });
    });
    
    moments.slice(0, 2).forEach(m => {
      activities.push({
        id: `mom-${m.id}`,
        type: 'moment',
        title: m.title,
        date: m.date,
        icon: 'trophy',
        color: theme.colors.warning,
        xp: 40,
      });
    });
    
    trips.slice(0, 2).forEach(t => {
      activities.push({
        id: `trip-${t.id}`,
        type: 'trip',
        title: t.name || `Tur ${t.distance}km`,
        date: t.completedAt,
        icon: 'footsteps',
        color: theme.colors.success,
        xp: t.xpEarned,
      });
    });
    
    // Sort by date and take 5
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [entries, moments, trips]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={[styles.container, level > 11 && levelColors.background && { backgroundColor: levelColors.background }]}>
      {/* Animated level-based background stripes */}
      <LevelBackground 
        level={level} 
        boosted={quickPopup.visible || showCelebration}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
        bounces={true}
      >
        {/* HERO: Level Card - Compact but impactful - Tappable to open Journey Wrapped */}
        {!gamificationLoading && totalXP !== null && (
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('JourneyWrapped', {
                level,
                totalXP,
                stats: combinedStats,
                achievements: unlockedAchievements,
                xpProgress,
              })}
            >
              <LinearGradient
                colors={[levelColors.primary, levelColors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroContent}>
                  <View style={styles.heroLeft}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelNumber}>{level}</Text>
                    </View>
                  </View>
                  <View style={styles.heroCenter}>
                    <Text style={styles.levelName}>{getLevelName(level)}</Text>
                    <Text style={styles.xpText}>{totalXP.toLocaleString()} XP</Text>
                    {xpProgress.next && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${xpProgress.progress * 100}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round(xpProgress.progress * 100)}% til nivå {level + 1}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.heroRight}>
                    {animConfig.epic ? (
                      <View style={styles.epicBadge}>
                        <Icon name="sparkles" size={20} color="#FFD700" />
                      </View>
                    ) : (
                      <Icon name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* SECTION: Daily Quests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="flash" size={20} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Tjen XP i dag</Text>
          </View>
          <View style={styles.questsGrid}>
            {dailyQuests.map((quest) => (
              <TouchableOpacity
                key={quest.id}
                style={styles.questCard}
                onPress={quest.action}
                activeOpacity={0.7}
              >
                <View style={[styles.questIcon, { backgroundColor: quest.color + '20' }]}>
                  <Icon name={quest.icon} size={24} color={quest.color} />
                </View>
                <Text style={styles.questTitle} numberOfLines={1}>{quest.title}</Text>
                <View style={styles.questXP}>
                  <Icon name="star" size={12} color={theme.colors.warning} />
                  <Text style={styles.questXPText}>+{quest.xp}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION: Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{combinedStats.totalTrips}</Text>
            <Text style={styles.statLabel}>Turer</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{combinedStats.totalReflections}</Text>
            <Text style={styles.statLabel}>Refleksjoner</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{combinedStats.totalSkills}</Text>
            <Text style={styles.statLabel}>Ferdigheter</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.floor((combinedStats.currentStreak || 0) / 7)}</Text>
            <Text style={styles.statLabel}>Uker streak</Text>
          </View>
        </View>

        {/* SECTION: Pedometer - Daily Steps */}
        {pedometerAvailable && !isWeb && (
          <View style={styles.pedometerCard}>
            <View style={styles.pedometerHeader}>
              <View style={styles.pedometerIconContainer}>
                <Icon name="footsteps" size={22} color={theme.colors.success} />
              </View>
              <View style={styles.pedometerInfo}>
                <Text style={styles.pedometerTitle}>Dagens skritt</Text>
                <Text style={styles.pedometerSteps}>{todaySteps.toLocaleString()}</Text>
              </View>
              <View style={styles.pedometerXPBadge}>
                <Icon name="star" size={12} color={theme.colors.warning} />
                <Text style={styles.pedometerXPText}>+{pedometerXPToday} XP</Text>
              </View>
            </View>
            <View style={styles.pedometerProgressContainer}>
              <View style={styles.pedometerProgressBar}>
                <LinearGradient
                  colors={[theme.colors.success, '#4ADE80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.pedometerProgressFill,
                    { width: `${Math.min((pedometerXPToday / MAX_PEDOMETER_XP_PER_DAY) * 100, 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.pedometerProgressText}>
                {pedometerXPToday}/{MAX_PEDOMETER_XP_PER_DAY} XP i dag • {STEPS_PER_XP} skritt = 1 XP
              </Text>
            </View>
          </View>
        )}

        {/* SECTION: Achievements - Compact badge row */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => navigation.navigate('Milestones')}
              activeOpacity={0.7}
            >
              <Icon name="trophy" size={20} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Prestasjoner</Text>
              <View style={styles.achievementCountBadge}>
                <Text style={styles.achievementCountText}>{unlockedAchievements.length}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsRow}
            >
              {unlockedAchievements.slice(0, 8).map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={styles.achievementBadge}
                  onPress={() => handleAchievementPress(achievement)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.warning, '#FFD60A']}
                    style={styles.achievementIcon}
                  >
                    <Icon name={achievement.icon} size={20} color={theme.colors.white} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
              {unlockedAchievements.length > 8 && (
                <TouchableOpacity
                  style={styles.achievementMore}
                  onPress={() => navigation.navigate('Milestones')}
                >
                  <Text style={styles.achievementMoreText}>+{unlockedAchievements.length - 8}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* SECTION: Next Goal - Single focused milestone */}
        {nextGoal && (
          <TouchableOpacity 
            style={styles.goalCard}
            onPress={() => navigation.navigate('Milestones')}
            activeOpacity={0.8}
          >
            <View style={styles.goalIcon}>
              <Icon name={nextGoal.icon} size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>Neste mål</Text>
              <Text style={styles.goalTitle}>{nextGoal.title}</Text>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: `${nextGoal.progress * 100}%` }]} />
                </View>
                <Text style={styles.goalProgressText}>
                  {nextGoal.currentValue}/{nextGoal.threshold}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* SECTION: Recent Activity Feed */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Nylig aktivitet</Text>
            </View>
            <View style={styles.activityFeed}>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                    <Icon name={activity.icon} size={16} color={activity.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                    <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
                  </View>
                  <View style={styles.activityXP}>
                    <Text style={styles.activityXPText}>+{activity.xp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SECTION: Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="apps-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Utforsk</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('TripPlanner')}
              activeOpacity={0.7}
            >
              <Icon name="add-circle" size={24} color={theme.colors.success} />
              <Text style={styles.actionLabel} numberOfLines={1}>Ny tur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyTrips')}
              activeOpacity={0.7}
            >
              <Icon name="footsteps" size={24} color={theme.colors.success} />
              <Text style={styles.actionLabel} numberOfLines={1}>Turer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Skills')}
              activeOpacity={0.7}
            >
              <Icon name="star" size={24} color={theme.colors.warning} />
              <Text style={styles.actionLabel} numberOfLines={1}>Ferdighet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MasteryLog')}
              activeOpacity={0.7}
            >
              <Icon name="book" size={24} color={theme.colors.info} />
              <Text style={styles.actionLabel} numberOfLines={1}>Logg</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.actionsGrid, { marginTop: theme.spacing.sm }]}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Expeditions')}
              activeOpacity={0.7}
            >
              <Icon name="compass" size={24} color={theme.colors.primary} />
              <Text style={styles.actionLabel} numberOfLines={1}>Ekspedisjon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('EnvironmentActions')}
              activeOpacity={0.7}
            >
              <Icon name="leaf" size={24} color={theme.colors.success} />
              <Text style={styles.actionLabel} numberOfLines={1}>Miljø</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Milestones')}
              activeOpacity={0.7}
            >
              <Icon name="trophy" size={24} color={theme.colors.warning} />
              <Text style={styles.actionLabel} numberOfLines={1}>Milepæler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyRegistrations')}
              activeOpacity={0.7}
            >
              <Icon name="calendar" size={24} color={theme.colors.primary} />
              <Text style={styles.actionLabel} numberOfLines={1}>Påmeldt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button - Hidden at bottom */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetAllData}
          activeOpacity={0.7}
        >
          <Icon name="refresh-outline" size={16} color={theme.colors.textTertiary} />
          <Text style={styles.resetButtonText}>Nullstill data</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick Add Modal */}
      <Modal
        visible={showQuickAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuickAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowQuickAddModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {quickAddType === 'reflection' ? 'Ny refleksjon' : 
                   quickAddType === 'moment' ? 'Nytt mestringsmoment' : 'Legg til'}
                </Text>
                <TouchableOpacity onPress={() => setShowQuickAddModal(false)}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {quickAddType === 'reflection' && (
                <View style={styles.modalBody}>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Hva har du lært eller opplevd i dag?"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={reflectionText}
                    onChangeText={setReflectionText}
                    autoFocus
                  />
                  <View style={styles.xpHint}>
                    <Icon name="star" size={14} color={theme.colors.warning} />
                    <Text style={styles.xpHintText}>+30 XP</Text>
                  </View>
                </View>
              )}

              {quickAddType === 'moment' && (
                <View style={styles.modalBody}>
                  <TextInput
                    style={[styles.textInput, { minHeight: 60 }]}
                    placeholder="Hva mestret du i dag?"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={momentTitle}
                    onChangeText={setMomentTitle}
                    autoFocus
                  />
                  <View style={styles.categoryRow}>
                    {[
                      { key: 'physical', label: 'Fysisk', icon: 'fitness', color: theme.colors.success },
                      { key: 'social', label: 'Sosial', icon: 'people', color: theme.colors.info },
                      { key: 'emotional', label: 'Mental', icon: 'heart', color: theme.colors.warning },
                    ].map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.categoryChip,
                          momentCategory === cat.key && { backgroundColor: cat.color + '20', borderColor: cat.color },
                        ]}
                        onPress={() => setMomentCategory(cat.key)}
                      >
                        <Icon name={cat.icon} size={16} color={momentCategory === cat.key ? cat.color : theme.colors.textSecondary} />
                        <Text style={[styles.categoryChipText, momentCategory === cat.key && { color: cat.color }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.xpHint}>
                    <Icon name="star" size={14} color={theme.colors.warning} />
                    <Text style={styles.xpHintText}>+40 XP</Text>
                  </View>
                </View>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowQuickAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    ((quickAddType === 'reflection' && !reflectionText.trim()) ||
                     (quickAddType === 'moment' && !momentTitle.trim())) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSaveQuickAdd}
                  disabled={(quickAddType === 'reflection' && !reflectionText.trim()) ||
                           (quickAddType === 'moment' && !momentTitle.trim())}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Lagre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Achievement Modal */}
      <Modal
        visible={showAchievementModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <Pressable 
          style={styles.achievementModalOverlay}
          onPress={() => setShowAchievementModal(false)}
        >
          <Pressable style={styles.achievementModalContent} onPress={e => e.stopPropagation()}>
            {selectedAchievement && (
              <>
                <LinearGradient
                  colors={[theme.colors.warning, '#FFD60A']}
                  style={styles.achievementModalIcon}
                >
                  <Icon name={selectedAchievement.icon} size={48} color={theme.colors.white} />
                </LinearGradient>
                <Text style={styles.achievementModalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.achievementModalDesc}>{selectedAchievement.description}</Text>
                <View style={styles.achievementModalXP}>
                  <Icon name="star" size={16} color={theme.colors.warning} />
                  <Text style={styles.achievementModalXPText}>+{selectedAchievement.xpReward} XP</Text>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* XP Celebration */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={dismissCelebration}
        pointerEvents={showCelebration ? 'auto' : 'none'}
      >
        <XPCelebration
          visible={showCelebration}
          xpAmount={celebrationXP}
          levelUp={celebrationLevelUp}
          newLevel={celebrationNewLevel}
          celebrationType={celebrationType}
          onComplete={onCelebrationComplete}
        />
      </Pressable>

      <QuickXPPopup
        visible={quickPopup.visible}
        xpAmount={quickPopup.xp}
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWeb: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: 20,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: {},
  heroCenter: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  heroRight: {
    marginLeft: theme.spacing.sm,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white,
  },
  levelName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 2,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {},
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  epicBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Quests
  questsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  questCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  questXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questXPText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.warning,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: 16,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
  },

  // Pedometer Card
  pedometerCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: 16,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  pedometerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pedometerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pedometerInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  pedometerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  pedometerSteps: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  pedometerXPBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pedometerXPText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  pedometerProgressContainer: {
    marginTop: theme.spacing.xs,
  },
  pedometerProgressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  pedometerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pedometerProgressText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 6,
    textAlign: 'center',
  },

  // Achievements
  achievementCountBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  achievementCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  achievementBadge: {
    padding: 2,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementMore: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },

  // Goal Card
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: 16,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  goalLabel: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Activity Feed
  activityFeed: {
    gap: theme.spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activityDate: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  activityXP: {
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activityXPText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.warning,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  resetButtonText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    paddingHorizontal: theme.spacing.lg,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 14,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  xpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.md,
    alignSelf: 'flex-end',
  },
  xpHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },

  // Achievement Modal
  achievementModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  achievementModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...theme.shadows.large,
  },
  achievementModalIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  achievementModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  achievementModalDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  achievementModalXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  achievementModalXPText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.warning,
  },
});

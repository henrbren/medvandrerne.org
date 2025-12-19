import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useGamification } from '../hooks/useGamification';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useSkills } from '../hooks/useSkills';
import { getAchievementMotivation } from '../utils/journeyUtils';

const isWeb = Platform.OS === 'web';

export default function MilestonesScreen({ navigation }) {
  const { stats: activityStats } = useActivityStats();
  const { getStats: getMasteryStats } = useMasteryLog();
  const { getStats: getTrackingStats } = useActivityTracking();
  const { getStats: getSkillsStats, getTotalXPEarned } = useSkills();
  
  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();
  
  const combinedStats = useMemo(() => ({
    totalActivities: activityStats.totalActivities || 0,
    totalReflections: masteryStats.totalEntries || 0,
    totalMoments: masteryStats.totalMoments || 0,
    currentStreak: activityStats.currentStreak || 0,
    totalExpeditions: trackingStats.totalExpeditions || 0,
    totalEnvironmentActions: trackingStats.totalEnvironmentActions || 0,
    totalSkills: skillsStats.completedSkills || 0,
    skillsXP: skillsXP,
  }), [
    activityStats.totalActivities,
    activityStats.currentStreak,
    masteryStats.totalEntries,
    masteryStats.totalMoments,
    trackingStats.totalExpeditions,
    trackingStats.totalEnvironmentActions,
    skillsStats.completedSkills,
    skillsXP,
  ]);

  const {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    totalXP,
    level,
  } = useGamification(combinedStats);

  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);


  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const calculateProgress = (achievement) => {
    let currentValue = 0;

    switch (achievement.category) {
      case 'activities': currentValue = combinedStats?.totalActivities || 0; break;
      case 'reflections': currentValue = combinedStats?.totalReflections || 0; break;
      case 'moments': currentValue = combinedStats?.totalMoments || 0; break;
      case 'streak': 
        // Convert days to weeks for streak achievements
        const streakDays = combinedStats?.currentStreak || 0;
        currentValue = Math.floor(streakDays / 7);
        break;
      case 'expeditions': currentValue = combinedStats?.totalExpeditions || 0; break;
      case 'environment': currentValue = combinedStats?.totalEnvironmentActions || 0; break;
      case 'skills': currentValue = combinedStats?.totalSkills || 0; break;
      case 'combined': currentValue = (combinedStats?.totalActivities || 0) + (combinedStats?.totalSkills || 0); break;
      case 'level': currentValue = level; break;
    }

    const progress = achievement.threshold > 0 
      ? Math.min(currentValue / achievement.threshold, 1) 
      : 0;

    return { currentValue, progress };
  };

  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') {
      return achievements.filter(a => a.unlocked);
    } else if (filter === 'locked') {
      return achievements.filter(a => !a.unlocked);
    }
    return achievements;
  }, [achievements, filter]);

  const groupedAchievements = useMemo(() => {
    const groups = {};
    filteredAchievements.forEach(achievement => {
      const category = achievement.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
    });
    return groups;
  }, [filteredAchievements]);

  const categoryNames = {
    activities: 'Aktiviteter',
    reflections: 'Refleksjoner',
    moments: 'Mestringsmomenter',
    streak: 'Streaks',
    expeditions: 'Ekspedisjoner',
    environment: 'Miljø',
    skills: 'Ferdigheter',
    combined: 'Kombinert',
    level: 'Nivå',
    other: 'Andre',
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
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[theme.colors.info, '#22D3EE']}
              style={styles.headerIcon}
            >
              <Icon name="flag" size={32} color={theme.colors.white} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Alle milepæler</Text>
              <Text style={styles.headerSubtitle}>
                {unlockedAchievements.length} av {achievements.length} oppnådd
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Filter Buttons */}
        <Animated.View style={[styles.filters, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unlocked' && styles.filterButtonActive]}
            onPress={() => setFilter('unlocked')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'unlocked' && styles.filterTextActive]}>
              Oppnådd ({unlockedAchievements.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'locked' && styles.filterButtonActive]}
            onPress={() => setFilter('locked')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'locked' && styles.filterTextActive]}>
              Låst ({lockedAchievements.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Achievements by Category */}
        {Object.keys(groupedAchievements).map((category) => (
          <Animated.View key={category} style={[styles.categorySection, { opacity: fadeAnim }]}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{categoryNames[category] || category}</Text>
              <Text style={styles.categoryCount}>
                {groupedAchievements[category].filter(a => a.unlocked).length} / {groupedAchievements[category].length}
              </Text>
            </View>
            <View style={styles.achievementsGrid}>
              {groupedAchievements[category].map((achievement) => {
                const { currentValue, progress } = calculateProgress(achievement);
                const isUnlocked = achievement.unlocked;

                return (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      isUnlocked && styles.achievementCardUnlocked,
                    ]}
                    onPress={() => handleAchievementPress(achievement)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.achievementIconContainer,
                      isUnlocked && styles.achievementIconContainerUnlocked,
                    ]}>
                      {isUnlocked ? (
                        <LinearGradient
                          colors={[theme.colors.warning, '#FFD60A']}
                          style={styles.achievementIconGradient}
                        >
                          <Icon name={achievement.icon} size={32} color={theme.colors.white} />
                        </LinearGradient>
                      ) : (
                        <View style={styles.achievementIconLocked}>
                          <Icon name={achievement.icon} size={32} color={theme.colors.textTertiary} />
                        </View>
                      )}
                      {isUnlocked && (
                        <View style={styles.unlockedBadge}>
                          <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.achievementTitle,
                      !isUnlocked && styles.achievementTitleLocked,
                    ]} numberOfLines={2}>
                      {achievement.title}
                    </Text>
                    {!isUnlocked && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progress * 100}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {currentValue} / {achievement.threshold}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Achievement Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          setSelectedAchievement(null);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowModal(false);
              setSelectedAchievement(null);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContentWrapper}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.achievementModalHeader}>
                    {selectedAchievement?.unlocked ? (
                      <LinearGradient
                        colors={[theme.colors.warning, '#FFD60A']}
                        style={styles.achievementModalIcon}
                      >
                        <Icon 
                          name={selectedAchievement?.icon || 'trophy'} 
                          size={32} 
                          color={theme.colors.white} 
                        />
                      </LinearGradient>
                    ) : (
                      <View style={styles.achievementModalIconLocked}>
                        <Icon 
                          name={selectedAchievement?.icon || 'flag'} 
                          size={32} 
                          color={theme.colors.textTertiary} 
                        />
                      </View>
                    )}
                    <View style={styles.achievementModalTitleContainer}>
                      <Text style={styles.modalTitle}>
                        {selectedAchievement?.title || 'Milepæl'}
                      </Text>
                      <Text style={styles.achievementModalDescription}>
                        {selectedAchievement?.description || ''}
                      </Text>
                      {selectedAchievement && !selectedAchievement.unlocked && (
                        <Text style={styles.milestoneProgressText}>
                          {calculateProgress(selectedAchievement).currentValue} / {selectedAchievement.threshold}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      setSelectedAchievement(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.achievementMotivationContainer}>
                    <Text style={styles.achievementMotivationText}>
                      {selectedAchievement ? getAchievementMotivation(selectedAchievement.id) : 'Ingen milepæl valgt'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowModal(false);
                      setSelectedAchievement(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelText}>Lukk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  headerSubtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  categorySection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  categoryCount: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  achievementCard: {
    width: 'calc(50% - 8px)',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
    ...(isWeb && {
      width: 'calc(33.333% - 12px)',
    }),
  },
  achievementCardUnlocked: {
    borderWidth: 2,
    borderColor: theme.colors.warning + '40',
  },
  achievementIconContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  achievementIconContainerUnlocked: {
    marginBottom: theme.spacing.sm,
  },
  achievementIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  achievementIconLocked: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  unlockedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  achievementTitle: {
    ...theme.typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  achievementTitleLocked: {
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs / 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  achievementModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    flex: 1,
  },
  achievementModalIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  achievementModalIconLocked: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  achievementModalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  achievementModalDescription: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  milestoneProgressText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: theme.spacing.lg,
    maxHeight: 300,
  },
  achievementMotivationContainer: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  achievementMotivationText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
  },
  modalCancelText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
});


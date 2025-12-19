import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useSkills, SKILLS } from '../hooks/useSkills';

const isWeb = Platform.OS === 'web';

const CATEGORY_NAMES = {
  survival: 'Overlevelse',
  navigation: 'Navigasjon',
  safety: 'Sikkerhet',
  social: 'Sosialt',
  physical: 'Fysisk',
  endurance: 'Utholdenhet',
};

const CATEGORY_COLORS = {
  survival: theme.colors.warning,
  navigation: theme.colors.info,
  safety: theme.colors.error,
  social: theme.colors.primary,
  physical: theme.colors.success,
  endurance: theme.colors.primaryLight,
};

export default function SkillsScreen({ navigation }) {
  const { completedSkills, toggleSkill, isSkillCompleted, getStats, getTotalXPEarned, loading } = useSkills();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const stats = getStats();
  const skillsByCategory = Object.entries(
    SKILLS.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push({
        ...skill,
        completed: isSkillCompleted(skill.id),
      });
      return acc;
    }, {})
  );

  const filteredSkills = selectedCategory
    ? skillsByCategory.filter(([category]) => category === selectedCategory)
    : skillsByCategory;

  const handleSkillToggle = async (skillId) => {
    const wasAdded = await toggleSkill(skillId);
    if (wasAdded) {
      // Skill was added - XP will be recalculated via gamification system
      // The screen will refresh when navigated back to
    }
  };

  const getCategoryStats = (category) => {
    const categorySkills = SKILLS.filter(s => s.category === category);
    const completed = categorySkills.filter(s => isSkillCompleted(s.id)).length;
    return { total: categorySkills.length, completed };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laster...</Text>
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
      >
        {/* Stats Header */}
        <Animated.View style={[styles.statsHeader, { opacity: fadeAnim }]}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completedSkills}</Text>
              <Text style={styles.statLabel}>Ferdigheter</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalSkills}</Text>
              <Text style={styles.statLabel}>Totalt</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalXPEarned}</Text>
              <Text style={styles.statLabel}>XP tjent</Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View style={[styles.categoriesContainer, { opacity: fadeAnim }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Alle
              </Text>
            </TouchableOpacity>
            {Object.keys(CATEGORY_NAMES).map((category) => {
              const categoryStats = getCategoryStats(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                    selectedCategory === category && {
                      backgroundColor: CATEGORY_COLORS[category] + '20',
                      borderColor: CATEGORY_COLORS[category],
                    },
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                      selectedCategory === category && {
                        color: CATEGORY_COLORS[category],
                      },
                    ]}
                  >
                    {CATEGORY_NAMES[category]} ({categoryStats.completed}/{categoryStats.total})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Skills List */}
        <Animated.View style={[styles.skillsContainer, { opacity: fadeAnim }]}>
          {filteredSkills.map(([category, skills]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: CATEGORY_COLORS[category] + '20' },
                  ]}
                >
                  <Icon
                    name="star"
                    size={20}
                    color={CATEGORY_COLORS[category]}
                  />
                </View>
                <Text style={styles.categoryTitle}>
                  {CATEGORY_NAMES[category]}
                </Text>
                <Text style={styles.categoryCount}>
                  {getCategoryStats(category).completed}/
                  {getCategoryStats(category).total}
                </Text>
              </View>

              <View style={styles.skillsList}>
                {skills.map((skill) => {
                  const completed = skill.completed;
                  return (
                    <TouchableOpacity
                      key={skill.id}
                      style={[
                        styles.skillCard,
                        completed && styles.skillCardCompleted,
                      ]}
                      onPress={() => handleSkillToggle(skill.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.skillContent}>
                        <View
                          style={[
                            styles.skillIconContainer,
                            {
                              backgroundColor: completed
                                ? CATEGORY_COLORS[category] + '30'
                                : theme.colors.surfaceElevated,
                            },
                          ]}
                        >
                          <Icon
                            name={skill.icon}
                            size={24}
                            color={
                              completed
                                ? CATEGORY_COLORS[category]
                                : theme.colors.textSecondary
                            }
                          />
                        </View>
                        <View style={styles.skillInfo}>
                          <Text
                            style={[
                              styles.skillName,
                              completed && styles.skillNameCompleted,
                            ]}
                          >
                            {skill.name}
                          </Text>
                          <Text style={styles.skillDescription}>
                            {skill.description}
                          </Text>
                          <View style={styles.skillXP}>
                            <Icon
                              name="star"
                              size={12}
                              color={theme.colors.warning}
                            />
                            <Text style={styles.skillXPText}>
                              {skill.xpReward} XP
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.checkbox,
                            completed && styles.checkboxCompleted,
                            completed && {
                              backgroundColor: CATEGORY_COLORS[category],
                              borderColor: CATEGORY_COLORS[category],
                            },
                          ]}
                        >
                          {completed && (
                            <Icon name="checkmark" size={16} color={theme.colors.white} />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
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
    paddingBottom: theme.spacing.xxxl,
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
  statsHeader: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
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
  statNumber: {
    ...theme.typography.h2,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  categoriesScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  categoryChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  skillsContainer: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  categoryCount: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  skillsList: {
    gap: theme.spacing.sm,
  },
  skillCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  skillCardCompleted: {
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
  },
  skillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  skillNameCompleted: {
    color: theme.colors.text,
  },
  skillDescription: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  skillXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillXPText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});


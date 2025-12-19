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
import { SAMPLE_ACTIVITIES } from '../constants/data';
import { getLevelColors, getLevelAnimationConfig, getLevelName, getAchievementMotivation } from '../utils/journeyUtils';

// Import components
import LevelCard from '../components/LevelCard';
import QuickStats from '../components/QuickStats';
import AchievementsList from '../components/AchievementsList';
import MilestonesList from '../components/MilestonesList';
import ReflectionsList from '../components/ReflectionsList';
import MomentsList from '../components/MomentsList';
import SkillsList from '../components/SkillsList';
import ReflectionModal from '../components/modals/ReflectionModal';
import MomentModal from '../components/modals/MomentModal';
import SkillModal from '../components/modals/SkillModal';
import AchievementModal from '../components/modals/AchievementModal';
import MilestoneModal from '../components/modals/MilestoneModal';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function MyJourneyScreen({ navigation: navigationProp }) {
  // Use navigation hook as fallback
  const navigationHook = useNavigation();
  const navigation = navigationProp || navigationHook;
  const { registrations, loadRegistrations } = useRegistrations();
  const { stats: activityStats, loading: statsLoading, completeActivity, isActivityCompleted } = useActivityStats();
  const { entries, moments, getStats: getMasteryStats, loadData, addEntry, addMoment } = useMasteryLog();
  const { expeditions, environmentActions, getStats: getTrackingStats, loadData: loadTrackingData } = useActivityTracking();
  const { skills, completedSkills, toggleSkill, getStats: getSkillsStats, getTotalXPEarned, loadSkills } = useSkills();
  
  // Modal states for quick add
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [momentTitle, setMomentTitle] = useState('');
  const [momentCategory, setMomentCategory] = useState('physical');
  
  // Combine stats for gamification - recalculate when data changes
  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();
  const combinedStats = React.useMemo(() => ({
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
  }), [
    activityStats.totalActivities,
    activityStats.totalCompletedActivities,
    activityStats.totalRegistrations,
    activityStats.currentStreak,
    masteryStats.totalEntries,
    masteryStats.totalMoments,
    trackingStats.totalExpeditions,
    trackingStats.totalEnvironmentActions,
    skillsStats.completedSkills,
    skillsXP,
  ]);
  
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Create multiple star animations for high levels
  const starAnims = useRef(
    Array.from({ length: 8 }, () => ({
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await loadRegistrations();
        await loadData();
        await loadTrackingData();
        await loadSkills();
        // Don't manually recalculate - useGamification hook will handle it automatically
        // when stats update. This prevents double calculations and blinking.
      };
      refreshData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    if (!hasAnimatedRef.current) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.normal,
        useNativeDriver: true,
      }).start(() => {
        hasAnimatedRef.current = true;
      });
    } else {
      fadeAnim.setValue(1);
    }
  }, []);

  // Level-based animations
  useEffect(() => {
    const animConfig = getLevelAnimationConfig(level);
    
    // Reset animations
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
    rotateAnim.setValue(0);
    
    // Reset star animations
    starAnims.forEach(star => {
      star.rotate.setValue(0);
      star.scale.setValue(0);
      star.opacity.setValue(0);
      star.translateX.setValue(0);
      star.translateY.setValue(0);
    });
    
    let pulseAnimation = null;
    let glowAnimation = null;
    let rotateAnimation = null;
    const starAnimations = [];
    
    if (animConfig.pulse) {
      // Pulse animation - faster and stronger with higher intensity
      const intensity = animConfig.intensity || 1;
      const pulseScale = 1 + (0.05 * intensity);
      const pulseDuration = animConfig.rapid ? 800 / intensity : 1500 / intensity;
      
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: pulseScale,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }

    if (animConfig.glow) {
      // Glow animation - faster and more intense with higher levels
      const intensity = animConfig.intensity || 1;
      const glowDuration = animConfig.rapid ? 1000 / intensity : 2000 / intensity;
      
      glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: glowDuration,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: glowDuration,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
    }

    if (animConfig.stars) {
      // Rotating stars animation - faster with higher intensity
      const intensity = animConfig.intensity || 1;
      const rotationDuration = animConfig.rapid ? 5000 / intensity : 10000 / intensity;
      
      rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: rotationDuration,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Individual star animations
      starAnims.forEach((star, index) => {
        const angle = (index * 360) / starAnims.length;
        const radius = 80;
        const delay = index * 200;
        
        // Initial scale and opacity animation
        const scaleAnim = Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(star.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(star.opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(star.scale, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(star.scale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        
        // Rotation animation
        const rotateStarAnim = Animated.loop(
          Animated.timing(star.rotate, {
            toValue: 1,
            duration: 3000 + (index * 200),
            useNativeDriver: true,
          })
        );
        
        scaleAnim.start();
        rotateStarAnim.start();
        starAnimations.push(scaleAnim, rotateStarAnim);
      });
    }

    if (animConfig.particles) {
      // Particle animation - stars floating around
      starAnims.forEach((star, index) => {
        const particleAnim = Animated.loop(
          Animated.sequence([
            Animated.delay(index * 300),
            Animated.parallel([
              Animated.timing(star.translateY, {
                toValue: -30,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(star.opacity, {
                toValue: 0.7,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(star.translateY, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(star.opacity, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        particleAnim.start();
        starAnimations.push(particleAnim);
      });
    }

    return () => {
      if (pulseAnimation) pulseAnimation.stop();
      if (glowAnimation) glowAnimation.stop();
      if (rotateAnimation) rotateAnimation.stop();
      starAnimations.forEach(anim => anim.stop());
    };
  }, [level]);

  const registeredActivities = SAMPLE_ACTIVITIES.filter(activity => 
    registrations.includes(activity.id)
  );

  const handleAddReflection = async () => {
    if (reflectionText.trim() || gratitudeText.trim()) {
      await addEntry({
        reflection: reflectionText.trim(),
        gratitude: gratitudeText.trim(),
        category: 'general',
      });
      setReflectionText('');
      setGratitudeText('');
      setShowReflectionModal(false);
      await loadData(); // Refresh data
      // XP will be recalculated automatically by useGamification hook when stats update
    }
  };

  const handleAddMoment = async () => {
    if (momentTitle.trim()) {
      await addMoment({
        title: momentTitle.trim(),
        category: momentCategory,
        description: '',
      });
      setMomentTitle('');
      setShowMomentModal(false);
      await loadData(); // Refresh data
      // XP will be recalculated automatically by useGamification hook when stats update
    }
  };

  const handleToggleSkill = async (skillId) => {
    await toggleSkill(skillId);
    await loadSkills(); // Refresh skills data
    // XP will be recalculated automatically by useGamification hook when stats update
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStreakMessage = () => {
    const streakDays = activityStats.currentStreak || 0;
    const streakWeeks = Math.floor(streakDays / 7);
    
    if (streakDays === 0) {
      return 'Start din reise i dag!';
    } else if (streakDays === 1) {
      return 'Fantastisk start!';
    } else if (streakDays < 7) {
      return `${streakDays} dag${streakDays > 1 ? 'er' : ''} på rad - du holder det gående!`;
    } else if (streakWeeks < 4) {
      return `${streakWeeks} uke${streakWeeks > 1 ? 'r' : ''} på rad - du holder det gående!`;
    } else if (streakWeeks < 8) {
      return `${streakWeeks} uker på rad - imponerende!`;
    } else {
      return `${streakWeeks} uker på rad - du er en inspirasjon!`;
    }
  };


  const handleAchievementPress = (achievement) => {
    console.log('handleAchievementPress called with:', achievement);
    if (!achievement) {
      console.error('No achievement provided');
      return;
    }
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
    console.log('showAchievementModal set to true, selectedAchievement:', achievement);
  };

  const handleMilestonePress = (milestone) => {
    console.log('handleMilestonePress called with:', milestone);
    if (!milestone) {
      console.error('No milestone provided');
      return;
    }
    setSelectedMilestone(milestone);
    setShowMilestoneModal(true);
    console.log('showMilestoneModal set to true, selectedMilestone:', milestone);
  };

  const resetAllData = async () => {
    Alert.alert(
      'Nullstill alt',
      'Er du sikker på at du vil nullstille all data i "Min vandring"? Dette kan ikke angres.',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Nullstill',
          style: 'destructive',
          onPress: async () => {
            try {
              // Slett alle storage keys
              await Promise.all([
                AsyncStorage.removeItem('@medvandrerne_gamification'),
                AsyncStorage.removeItem('@medvandrerne_skills'),
                AsyncStorage.removeItem('@medvandrerne_mastery_log'),
                AsyncStorage.removeItem('@medvandrerne_mastery_moments'),
                AsyncStorage.removeItem('@medvandrerne_expeditions'),
                AsyncStorage.removeItem('@medvandrerne_environment_actions'),
                AsyncStorage.removeItem('@medvandrerne_activity_stats'),
                AsyncStorage.removeItem('@medvandrerne_registrations'),
              ]);

              // Wait a bit to ensure storage is cleared
              await new Promise(resolve => setTimeout(resolve, 200));

              // Reload all data - await to ensure they complete
              // These functions will load empty arrays when no data exists
              await Promise.all([
                loadRegistrations(),
                loadData(),
                loadTrackingData(),
                loadSkills(),
              ]);

              // Wait longer to ensure all React state updates are complete
              // This gives React time to update all state from the load functions
              await new Promise(resolve => setTimeout(resolve, 500));

              // First reload gamification data to clear unlocked achievements and XP
              await reloadGamificationData();

              // Wait a bit more for state to settle
              await new Promise(resolve => setTimeout(resolve, 200));

              // Then force a recalculation using current (reset) stats
              // This will recalculate XP based on the now-empty stats
              await recalculateXP();

              // Reset animation state so screen animates again
              hasAnimatedRef.current = false;

              Alert.alert('Suksess', 'All data har blitt nullstilt.');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Feil', 'Kunne ikke nullstille data. Prøv igjen.');
            }
          },
        },
      ]
    );
  };

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('showAchievementModal changed to:', showAchievementModal);
    console.log('selectedAchievement:', selectedAchievement);
  }, [showAchievementModal, selectedAchievement]);

  const AnimatedSection = ({ children, delay = 0 }) => {
    const cardFade = useRef(new Animated.Value(hasAnimatedRef.current ? 1 : 0)).current;
    const cardSlide = useRef(new Animated.Value(hasAnimatedRef.current ? 0 : 20)).current;

    useEffect(() => {
      if (!hasAnimatedRef.current) {
        // Use separate animations with consistent useNativeDriver
        Animated.parallel([
          Animated.timing(cardFade, {
            toValue: 1,
            duration: theme.animations.normal,
            delay,
            useNativeDriver: false, // Changed to false for both to allow touch events
          }),
          Animated.spring(cardSlide, {
            toValue: 0,
            delay,
            ...theme.animations.spring,
            useNativeDriver: false, // Must match cardFade
          }),
        ]).start();
      }
    }, [delay]);

    return (
      <Animated.View
        style={{
          opacity: cardFade,
          transform: [{ translateY: cardSlide }],
        }}
        pointerEvents="box-none"
        collapsable={false}
        removeClippedSubviews={false}
      >
        {children}
      </Animated.View>
    );
  };

  // Star component for rotating stars around level card
  const RotatingStar = ({ index, starAnim, colors, animConfig }) => {
    const angle = (index * 360) / starAnims.length;
    const radius = 80;
    
    const rotateInterpolate = starAnim.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    const rotateMain = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    // Combine rotations
    const combinedRotate = Animated.add(
      rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 360],
      }),
      starAnim.rotate.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 360],
      })
    ).interpolate({
      inputRange: [0, 720],
      outputRange: ['0deg', '720deg'],
    });
    
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    const translateX = Animated.add(
      new Animated.Value(x),
      starAnim.translateX.interpolate({
        inputRange: [0, 1],
        outputRange: [0, x * 0.3],
      })
    );
    
    const translateY = Animated.add(
      new Animated.Value(y),
      starAnim.translateY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, y * 0.3],
      })
    );
    
    if (!animConfig.stars) return null;
    
    return (
      <Animated.View
        style={[
          styles.rotatingStar,
          {
            transform: [
              { translateX },
              { translateY },
              { rotate: rotateInterpolate },
              { scale: starAnim.scale },
            ],
            opacity: starAnim.opacity,
          },
        ]}
        pointerEvents="none"
      >
        <Icon name="star" size={16} color={colors.secondary || '#FFD700'} />
      </Animated.View>
    );
  };

  // Get background color for level > 11
  const levelColors = getLevelColors(level);
  const containerStyle = level > 11 && levelColors.background 
    ? [styles.container, { backgroundColor: levelColors.background }]
    : styles.container;

  return (
    <View style={containerStyle}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb,
        ]}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Header Section */}
        <AnimatedSection>
          <View style={styles.headerSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="map" size={32} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Min vandring</Text>
            </View>
          </View>
        </AnimatedSection>

        {/* Level & XP Section */}
        {!gamificationLoading && totalXP !== null && (
          <AnimatedSection delay={50}>
            <View style={styles.levelSection}>
              <View style={styles.levelCardContainer}>
                {/* Rotating stars around the card - outside card but inside container */}
                {(() => {
                  const colors = getLevelColors(level);
                  const animConfig = getLevelAnimationConfig(level);
                  return animConfig.stars ? starAnims.map((starAnim, index) => (
                    <RotatingStar
                      key={`star-${index}`}
                      index={index}
                      starAnim={starAnim}
                      colors={colors}
                      animConfig={animConfig}
                    />
                  )) : null;
                })()}
                <Animated.View
                  style={[
                    styles.levelCard,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  {(() => {
                    const colors = getLevelColors(level);
                    const animConfig = getLevelAnimationConfig(level);
                    const glowOpacity = glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    });
                    
                    return (
                      <>
                        {animConfig.glow && (
                          <Animated.View
                            style={[
                              styles.levelGlow,
                              {
                                backgroundColor: colors.glow,
                                opacity: glowOpacity,
                                shadowColor: colors.glow,
                                shadowRadius: 20,
                                shadowOpacity: 1,
                                elevation: 10,
                              },
                            ]}
                          />
                        )}
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          style={styles.levelGradient}
                        >
                          <View style={styles.levelHeader}>
                            <View style={[styles.levelBadge, { borderColor: 'rgba(255, 255, 255, 0.4)' }]}>
                              <Text style={styles.levelNumber}>{level}</Text>
                              {/* Sparkle effect inside badge for high levels */}
                              {animConfig.epic && (
                                <Animated.View
                                  style={[
                                    styles.badgeSparkle,
                                    {
                                      opacity: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1],
                                      }),
                                    },
                                  ]}
                                >
                                  <Icon name="star" size={12} color={theme.colors.white} />
                                </Animated.View>
                              )}
                            </View>
                            <View style={styles.levelInfo}>
                              <Text style={styles.levelLabel}>{getLevelName(level)}</Text>
                              <Text style={styles.levelSubLabel}>Nivå {level}</Text>
                              <Text style={styles.xpText}>{totalXP} XP</Text>
                            </View>
                          </View>
                          {xpProgress.next && (
                            <View style={styles.xpProgressContainer}>
                              <View style={styles.xpProgressBar}>
                                <Animated.View
                                  style={[
                                    styles.xpProgressFill,
                                    {
                                      width: `${xpProgress.progress * 100}%`,
                                      backgroundColor: colors.secondary,
                                    },
                                  ]}
                                />
                              </View>
                              <View style={styles.xpProgressText}>
                                <Text style={styles.xpProgressLabel}>
                                  {xpProgress.current} / {xpProgress.next} XP til neste nivå
                                </Text>
                              </View>
                            </View>
                          )}
                        </LinearGradient>
                      </>
                    );
                  })()}
                </Animated.View>
              </View>
            </View>
          </AnimatedSection>
        )}

        {/* Quick Stats - Compact */}
        <View style={styles.quickStatsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStatsScroll}
            nestedScrollEnabled={true}
          >
              <TouchableOpacity
                style={styles.quickStatCardCompact}
                onPress={() => navigation.navigate('MasteryLog')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="book" size={18} color={theme.colors.info} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{masteryStats.totalEntries}</Text>
                  <Text style={styles.quickStatLabelCompact}>Refleksjoner</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickStatCardCompact}
                onPress={() => navigation.navigate('MasteryLog')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="trophy" size={18} color={theme.colors.warning} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{masteryStats.totalMoments}</Text>
                  <Text style={styles.quickStatLabelCompact}>Mestringsmomenter</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.quickStatCardCompact}>
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="flame" size={18} color={theme.colors.success} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{Math.floor((activityStats.currentStreak || 0) / 7)}</Text>
                  <Text style={styles.quickStatLabelCompact}>Uker på rad</Text>
                </View>
              </View>

              <View style={styles.quickStatCardCompact}>
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="calendar" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{activityStats.totalActivities}</Text>
                  <Text style={styles.quickStatLabelCompact}>Aktiviteter</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.quickStatCardCompact}
                onPress={() => navigation.navigate('Expeditions')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="map" size={18} color={theme.colors.info} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{trackingStats.totalExpeditions}</Text>
                  <Text style={styles.quickStatLabelCompact}>Ekspedisjoner</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickStatCardCompact}
                onPress={() => navigation.navigate('EnvironmentActions')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="leaf" size={18} color={theme.colors.success} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{trackingStats.totalEnvironmentActions}</Text>
                  <Text style={styles.quickStatLabelCompact}>Miljøaksjoner</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickStatCardCompact}
                onPress={() => navigation.navigate('Skills')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="star" size={18} color={theme.colors.warning} />
                </View>
                <View style={styles.quickStatContentCompact}>
                  <Text style={styles.quickStatNumberCompact}>{skillsStats.completedSkills}</Text>
                  <Text style={styles.quickStatLabelCompact}>Ferdigheter</Text>
                </View>
              </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Achievements Section */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
              <Icon name="trophy" size={24} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Prestasjoner</Text>
              <Text style={styles.achievementCount}>{unlockedAchievements.length}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Se alle prestasjoner pressed');
                  navigation.navigate('Milestones');
                }}
                activeOpacity={0.7}
                style={styles.seeAllButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.seeAllButtonContent}>
                  <Text style={styles.seeAllLink}>Se alle</Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.achievementsContainer}>
              {/* Left fade gradient */}
              <LinearGradient
                colors={[theme.colors.background, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.achievementsFadeLeft}
                pointerEvents="none"
              />
              <View style={styles.achievementsListWrapper}>
                <FlatList
                  data={unlockedAchievements.slice(0, 6)}
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={styles.achievementsScroll}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: achievement }) => (
                    <TouchableOpacity
                      style={styles.achievementBadge}
                      onPress={() => {
                        console.log('Achievement badge pressed:', achievement.id);
                        handleAchievementPress(achievement);
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                      <LinearGradient
                        colors={[theme.colors.warning, '#FFD60A']}
                        style={styles.achievementGradient}
                      >
                        <Icon name={achievement.icon} size={32} color={theme.colors.white} />
                      </LinearGradient>
                      <Text style={styles.achievementTitle} numberOfLines={2}>
                        {achievement.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              {/* Right fade gradient */}
              <LinearGradient
                colors={['transparent', theme.colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.achievementsFadeRight}
                pointerEvents="none"
              />
            </View>
          </View>
        )}

        {/* Next Milestones */}
        {nextMilestones.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
              <Icon name="flag-outline" size={24} color={theme.colors.info} />
              <Text style={styles.sectionTitle}>Neste milepæler</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Se alle milepæler pressed');
                  navigation.navigate('Milestones');
                }}
                activeOpacity={0.7}
                style={styles.seeAllButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.seeAllButtonContent}>
                  <Text style={styles.seeAllLink}>Se alle</Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.milestonesList}>
                {nextMilestones.map((milestone) => {
                  const progress = milestone.progress || 0;
                  const currentValue = milestone.currentValue || 0;
                  const threshold = milestone.threshold || 1;
                  
                  return (
                    <TouchableOpacity
                      key={milestone.id}
                      style={styles.milestoneCard}
                      onPress={() => {
                        console.log('Milestone card pressed:', milestone.id);
                        handleMilestonePress(milestone);
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View style={styles.milestoneIcon}>
                        <Icon
                          name={milestone.icon}
                          size={24}
                          color={
                            progress > 0.5
                              ? theme.colors.success
                              : theme.colors.textTertiary
                          }
                        />
                      </View>
                      <View style={styles.milestoneContent}>
                        <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                        <View style={styles.milestoneProgressBar}>
                          <View
                            style={[
                              styles.milestoneProgressFill,
                              {
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor:
                                  progress > 0.5
                                    ? theme.colors.success
                                    : theme.colors.primary,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.milestoneProgressText}>
                          {currentValue} / {threshold}
                        </Text>
                      </View>
                      <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
        )}

        {/* Reflections Section */}
        <AnimatedSection delay={200}>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => {
                try {
                  if (navigation && navigation.navigate) {
                    navigation.navigate('MasteryLog');
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              activeOpacity={0.7}
            >
              <Icon name="book-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Refleksjoner</Text>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </AnimatedSection>
        
        {/* Quick Add Reflection Button - Outside AnimatedSection */}
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              console.log('Reflection button pressed');
              setShowReflectionModal(true);
            }}
            style={({ pressed }) => [
              styles.quickAddButtonWrapper,
              pressed && { opacity: 0.8 }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.quickAddGradient}
            >
              <Icon name="add-circle" size={24} color={theme.colors.white} />
              <Text style={styles.quickAddText}>Legg til refleksjon</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Reflections List */}
        <View style={styles.section}>
          {entries.length > 0 ? (
            <View style={styles.reflectionsList}>
              {entries.slice(0, 3).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.reflectionCard}
                  onPress={() => {
                    try {
                      if (navigation && navigation.navigate) {
                        navigation.navigate('MasteryLog');
                      }
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.reflectionHeader}>
                    <Text style={styles.reflectionDate}>{formatDate(entry.date)}</Text>
                    <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </View>
                  {entry.reflection && (
                    <Text style={styles.reflectionText} numberOfLines={2}>
                      {entry.reflection}
                    </Text>
                  )}
                  {entry.gratitude && (
                    <View style={styles.gratitudeBadge}>
                      <Icon name="heart" size={12} color={theme.colors.success} />
                      <Text style={styles.gratitudeText}>Takk</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReflections}>
              <Icon name="book-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyReflectionsText}>
                Ingen refleksjoner ennå. Start din reise!
              </Text>
            </View>
          )}
        </View>

        {/* Mastery Moments Section */}
        <AnimatedSection delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="trophy-outline" size={24} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Mestringsmomenter</Text>
            </View>
          </View>
        </AnimatedSection>
        
        {/* Quick Add Moment Button - Outside AnimatedSection */}
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              console.log('Moment button pressed');
              setShowMomentModal(true);
            }}
            style={({ pressed }) => [
              styles.quickAddButtonWrapper,
              pressed && { opacity: 0.8 }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.warning, '#FFD60A']}
              style={styles.quickAddGradient}
            >
              <Icon name="trophy" size={24} color={theme.colors.white} />
              <Text style={styles.quickAddText}>Legg til mestringsmoment</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Moments List */}
        <View style={styles.section}>
          {/* Recent Moments */}
          {moments.length > 0 ? (
            <View style={styles.momentsList}>
              {moments.slice(0, 3).map((moment) => (
                <TouchableOpacity
                  key={moment.id}
                  style={styles.momentCard}
                  onPress={() => {
                    try {
                      if (navigation && navigation.navigate) {
                        navigation.navigate('MasteryLog');
                      }
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                  activeOpacity={0.7}
                >
                    <View style={[
                      styles.momentCategoryIcon,
                      { backgroundColor: 
                        moment.category === 'physical' ? theme.colors.success + '20' :
                        moment.category === 'social' ? theme.colors.info + '20' :
                        theme.colors.warning + '20'
                      }
                    ]}>
                      <Icon
                        name={
                          moment.category === 'physical' ? 'fitness-outline' :
                          moment.category === 'social' ? 'people-outline' :
                          'heart-outline'
                        }
                        size={20}
                        color={
                          moment.category === 'physical' ? theme.colors.success :
                          moment.category === 'social' ? theme.colors.info :
                          theme.colors.warning
                        }
                      />
                    </View>
                    <View style={styles.momentContent}>
                      <Text style={styles.momentTitle}>{moment.title}</Text>
                      <Text style={styles.momentDate}>{formatDate(moment.date)}</Text>
                    </View>
                    <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyReflections}>
                <Icon name="trophy-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyReflectionsText}>
                  Ingen mestringsmomenter ennå. Feir dine prestasjoner!
                </Text>
              </View>
            )}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
            <Icon name="star-outline" size={24} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Ferdigheter</Text>
            <Text style={styles.achievementCount}>{completedSkills.length}</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('Se alle ferdigheter pressed');
                navigation.navigate('Skills');
              }}
              activeOpacity={0.7}
              style={styles.seeAllButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.seeAllButtonContent}>
                <Text style={styles.seeAllLink}>Se alle</Text>
                <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Quick Add Skill Button - Outside AnimatedSection */}
        <View style={styles.section}>
          <Pressable
            onPress={() => {
              console.log('Skill button pressed');
              setShowSkillModal(true);
            }}
            style={({ pressed }) => [
              styles.quickAddButtonWrapper,
              pressed && { opacity: 0.8 }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.warning, '#FFD60A']}
              style={styles.quickAddGradient}
            >
              <Icon name="star" size={24} color={theme.colors.white} />
              <Text style={styles.quickAddText}>Legg til ferdighet</Text>
            </LinearGradient>
          </Pressable>
        </View>


        <View style={styles.bottomSpacer} />

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetAllData}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={20} color={theme.colors.error} />
            <Text style={styles.resetButtonText}>Nullstill alt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quick Add Reflection Modal */}
      <Modal
        visible={showReflectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReflectionModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ny refleksjon</Text>
                <TouchableOpacity
                  onPress={() => setShowReflectionModal(false)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Icon name="bulb-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.inputLabel}>Hva lærte jeg i dag?</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Skriv din refleksjon her..."
                    value={reflectionText}
                    onChangeText={setReflectionText}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Icon name="heart-outline" size={20} color={theme.colors.success} />
                    <Text style={styles.inputLabel}>Hva er jeg takknemlig for?</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Skriv hva du er takknemlig for..."
                    value={gratitudeText}
                    onChangeText={setGratitudeText}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowReflectionModal(false);
                    setReflectionText('');
                    setGratitudeText('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    (!reflectionText.trim() && !gratitudeText.trim()) && styles.modalSaveButtonDisabled
                  ]}
                  onPress={handleAddReflection}
                  activeOpacity={0.7}
                  disabled={!reflectionText.trim() && !gratitudeText.trim()}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Lagre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Quick Add Moment Modal */}
      <Modal
        visible={showMomentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMomentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nytt mestringsmoment</Text>
                <TouchableOpacity
                  onPress={() => setShowMomentModal(false)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Beskriv ditt mestringsmoment</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="F.eks. Gikk en lang tur i dag"
                    value={momentTitle}
                    onChangeText={setMomentTitle}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Kategori</Text>
                  <View style={styles.categoryButtons}>
                    {[
                      { key: 'physical', label: 'Fysisk', icon: 'fitness-outline', color: theme.colors.success },
                      { key: 'social', label: 'Sosial', icon: 'people-outline', color: theme.colors.info },
                      { key: 'emotional', label: 'Emosjonell', icon: 'heart-outline', color: theme.colors.warning },
                    ].map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.categoryButton,
                          momentCategory === cat.key && styles.categoryButtonActive,
                          { borderColor: cat.color + '40' },
                          momentCategory === cat.key && { backgroundColor: cat.color + '20' },
                        ]}
                        onPress={() => setMomentCategory(cat.key)}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={cat.icon}
                          size={20}
                          color={momentCategory === cat.key ? cat.color : theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryButtonText,
                            momentCategory === cat.key && { color: cat.color },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowMomentModal(false);
                    setMomentTitle('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    !momentTitle.trim() && styles.modalSaveButtonDisabled
                  ]}
                  onPress={handleAddMoment}
                  activeOpacity={0.7}
                  disabled={!momentTitle.trim()}
                >
                  <LinearGradient
                    colors={[theme.colors.warning, '#FFD60A']}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Lagre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Quick Add Skill Modal */}
      <Modal
        visible={showSkillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSkillModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Legg til ferdighet</Text>
                <TouchableOpacity
                  onPress={() => setShowSkillModal(false)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.skillsGrid}>
                  {SKILLS.map((skill) => {
                    const isCompleted = completedSkills.includes(skill.id);
                    return (
                      <TouchableOpacity
                        key={skill.id}
                        style={[
                          styles.skillSelectCard,
                          isCompleted && styles.skillSelectCardCompleted,
                        ]}
                        onPress={() => {
                          handleToggleSkill(skill.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.skillSelectIcon,
                          { backgroundColor: isCompleted ? theme.colors.warning + '20' : theme.colors.surfaceElevated }
                        ]}>
                          <Icon
                            name={skill.icon}
                            size={24}
                            color={isCompleted ? theme.colors.warning : theme.colors.textSecondary}
                          />
                          {isCompleted && (
                            <View style={styles.skillCheckBadge}>
                              <Icon name="checkmark" size={16} color={theme.colors.white} />
                            </View>
                          )}
                        </View>
                        <View style={styles.skillSelectContent}>
                          <Text style={[
                            styles.skillSelectTitle,
                            isCompleted && { color: theme.colors.warning }
                          ]}>
                            {skill.name}
                          </Text>
                          <Text style={styles.skillSelectDescription} numberOfLines={2}>
                            {skill.description}
                          </Text>
                          <View style={styles.skillSelectXP}>
                            <Icon name="star" size={12} color={theme.colors.warning} />
                            <Text style={styles.skillSelectXPText}>+{skill.xpReward} XP</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowSkillModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Lukk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Achievement Modal */}
      <Modal
        visible={showAchievementModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAchievementModal(false);
          setSelectedAchievement(null);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowAchievementModal(false);
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
                  <View style={styles.achievementModalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedAchievement?.title || 'Prestasjon'}
                    </Text>
                    <Text style={styles.achievementModalDescription}>
                      {selectedAchievement?.description || ''}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowAchievementModal(false);
                    setSelectedAchievement(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.achievementMotivationContainer}>
                  <Text style={styles.achievementMotivationText}>
                    {selectedAchievement ? getAchievementMotivation(selectedAchievement.id) : 'Ingen prestasjon valgt'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAchievementModal(false);
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

      {/* Milestone Modal */}
      <Modal
        visible={showMilestoneModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowMilestoneModal(false);
          setSelectedMilestone(null);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowMilestoneModal(false);
              setSelectedMilestone(null);
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
                  <LinearGradient
                    colors={[theme.colors.info, '#22D3EE']}
                    style={styles.achievementModalIcon}
                  >
                    <Icon 
                      name={selectedMilestone?.icon || 'flag'} 
                      size={32} 
                      color={theme.colors.white} 
                    />
                  </LinearGradient>
                  <View style={styles.achievementModalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedMilestone?.title || 'Milepæl'}
                    </Text>
                    <Text style={styles.achievementModalDescription}>
                      {selectedMilestone?.description || ''}
                    </Text>
                    {selectedMilestone && (
                      <Text style={styles.milestoneProgressText}>
                        {selectedMilestone.currentValue || 0} / {selectedMilestone.threshold || 1}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowMilestoneModal(false);
                    setSelectedMilestone(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.achievementMotivationContainer}>
                  <Text style={styles.achievementMotivationText}>
                    {selectedMilestone ? getAchievementMotivation(selectedMilestone.id) : 'Ingen milepæl valgt'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowMilestoneModal(false);
                    setSelectedMilestone(null);
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
  topSpacer: {
    height: theme.spacing.md,
  },
  headerSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowSubtle,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
  },
  levelSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.md,
    zIndex: 1,
    position: 'relative',
  },
  levelCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 200,
    marginBottom: theme.spacing.md,
    zIndex: 1,
  },
  levelCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'visible',
    ...theme.shadows.medium,
    position: 'relative',
    width: '100%',
  },
  levelGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: theme.borderRadius.xl + 15,
    zIndex: -1,
    shadowOffset: { width: 0, height: 0 },
    pointerEvents: 'none',
  },
  rotatingStar: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    pointerEvents: 'none',
  },
  badgeSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  levelGradient: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelNumber: {
    ...theme.typography.h1,
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.white,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 2,
  },
  levelSubLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs / 2,
  },
  xpText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpProgressContainer: {
    marginTop: theme.spacing.sm,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
  },
  xpProgressLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  achievementCount: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.warning,
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  achievementsContainer: {
    minHeight: 120,
    zIndex: 1,
    elevation: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsListWrapper: {
    flex: 1,
    marginHorizontal: 0,
  },
  achievementsFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 20,
  },
  achievementsFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 20,
  },
  achievementsScroll: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 100,
    zIndex: 100,
    elevation: 100,
    justifyContent: 'center',
  },
  achievementBadgeContent: {
    width: '100%',
    alignItems: 'center',
  },
  achievementGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.small,
  },
  achievementTitle: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  milestonesList: {
    gap: theme.spacing.sm,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
    zIndex: 1,
    elevation: 2,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  milestoneProgressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs / 2,
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  milestoneProgressText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  streakIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  quickStatsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  quickStatsScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  quickStatCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    minWidth: 140,
    ...theme.shadows.small,
  },
  quickStatIconCompact: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatContentCompact: {
    flex: 1,
  },
  quickStatNumberCompact: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 24,
  },
  quickStatLabelCompact: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
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
    flex: 1,
  },
  seeAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    zIndex: 10,
    elevation: 10,
    minHeight: 32,
    justifyContent: 'center',
  },
  seeAllButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  seeAllLink: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  reflectionsList: {
    gap: theme.spacing.sm,
  },
  reflectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  reflectionDate: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  reflectionText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  gratitudeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  gratitudeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
  },
  momentsList: {
    gap: theme.spacing.sm,
  },
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  momentCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentContent: {
    flex: 1,
  },
  momentTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  momentDate: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  activitiesList: {
    gap: theme.spacing.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityDate: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
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
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  emptyTitle: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  quickAddButtonWrapper: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  quickAddButton: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.small,
  },
  quickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    minHeight: 50,
  },
  quickAddText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  emptyReflections: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyReflectionsText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 0,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    minHeight: '60%',
    width: '100%',
    ...theme.shadows.large,
    flexDirection: 'column',
    paddingHorizontal: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    flex: 1,
    minHeight: 200,
    paddingHorizontal: 0,
  },
  modalBodyContent: {
    padding: 0,
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  textInput: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  modalCancelText: {
    ...theme.typography.button,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    ...theme.typography.button,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceElevated,
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  skillsList: {
    gap: theme.spacing.sm,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillContent: {
    flex: 1,
  },
  skillTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  skillDescription: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  skillXPBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  skillXPText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  skillsGrid: {
    gap: theme.spacing.md,
  },
  skillSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  skillSelectCardCompleted: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10',
  },
  skillSelectIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skillCheckBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  skillSelectContent: {
    flex: 1,
  },
  skillSelectTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  skillSelectDescription: {
    ...theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  skillSelectXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  skillSelectXPText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  achievementModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  achievementModalIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  achievementModalTitleContainer: {
    flex: 1,
  },
  achievementModalDescription: {
    ...theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  achievementMotivationContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    minHeight: 150,
  },
  achievementMotivationText: {
    ...theme.typography.body,
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.text,
    textAlign: 'left',
  },
  resetSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  resetButtonText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
});


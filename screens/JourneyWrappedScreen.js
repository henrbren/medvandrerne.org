import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { getLevelColors, getLevelName, getLevelAnimationConfig } from '../utils/journeyUtils';

const { width, height } = Dimensions.get('window');

// Animated number counter component
const AnimatedCounter = ({ value, duration = 1500, prefix = '', suffix = '', style }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    setDisplayValue(0);
    
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    return () => animatedValue.removeListener(listener);
  }, [value, duration]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Text>
  );
};

// Single slide component
const Slide = ({ data, index, levelColors, animConfig, isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for epic levels
      if (animConfig.epic) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [isActive]);

  const renderContent = () => {
    switch (data.type) {
      case 'welcome':
        return (
          <View style={styles.slideContent}>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[levelColors.primary, levelColors.secondary]}
                style={styles.levelBadgeLarge}
              >
                <Text style={styles.levelNumberLarge}>{data.level}</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.welcomeTitle}>Din Vandring</Text>
            <Text style={styles.levelNameLarge}>{data.levelName}</Text>
            <Text style={styles.welcomeSubtitle}>Se tilbake på reisen din</Text>
          </View>
        );

      case 'xp':
        return (
          <View style={styles.slideContent}>
            <Icon name="star" size={56} color={levelColors.glow || levelColors.primary} />
            <Text style={styles.statLabel}>Totalt opptjent</Text>
            {isActive && (
              <View style={styles.xpValueRow}>
                <AnimatedCounter
                  value={data.totalXP}
                  duration={2000}
                  style={[styles.xpValueLarge, { color: levelColors.glow || '#FFD700' }]}
                />
                <Text style={[styles.xpSuffix, { color: levelColors.glow || '#FFD700' }]}>XP</Text>
              </View>
            )}
            <Text style={styles.statSubtext}>
              {data.totalXP >= 10000 ? '🔥 Imponerende!' : 
               data.totalXP >= 5000 ? '⭐ Sterk innsats!' : 
               data.totalXP >= 1000 ? '💪 God progresjon!' : '🌱 God start!'}
            </Text>
          </View>
        );

      case 'trips':
        return (
          <View style={styles.slideContent}>
            <Icon name="footsteps" size={60} color={theme.colors.success} />
            <Text style={styles.statLabel}>Turer gjennomført</Text>
            {isActive && (
              <AnimatedCounter
                value={data.totalTrips}
                duration={1500}
                style={styles.statValueHuge}
              />
            )}
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{data.totalDistance.toFixed(1)}</Text>
                <Text style={styles.statBoxLabel}>km gått</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{data.totalElevation.toLocaleString()}</Text>
                <Text style={styles.statBoxLabel}>høydemeter</Text>
              </View>
            </View>
            {data.totalDistance >= 100 && (
              <Text style={styles.funFact}>
                🌍 Du har gått {(data.totalDistance / 40075 * 100).toFixed(3)}% rundt jorden!
              </Text>
            )}
          </View>
        );

      case 'steps':
        return (
          <View style={styles.slideContent}>
            <Icon name="walk" size={60} color="#4ADE80" />
            <Text style={styles.statLabel}>Skritt i dag</Text>
            {isActive && (
              <AnimatedCounter
                value={data.todaySteps}
                duration={2000}
                style={styles.statValueHuge}
              />
            )}
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{data.pedometerXP}</Text>
                <Text style={styles.statBoxLabel}>XP fra skritt</Text>
              </View>
            </View>
            {data.todaySteps >= 10000 && (
              <Text style={styles.funFact}>
                🏃 Du har nådd 10 000 skritt-målet! Fantastisk!
              </Text>
            )}
            {data.todaySteps >= 5000 && data.todaySteps < 10000 && (
              <Text style={styles.funFact}>
                👟 Halvveis til 10 000 skritt! Fortsett sånn!
              </Text>
            )}
          </View>
        );

      case 'reflections':
        return (
          <View style={styles.slideContent}>
            <Icon name="book" size={60} color={theme.colors.info} />
            <Text style={styles.statLabel}>Refleksjoner skrevet</Text>
            {isActive && (
              <AnimatedCounter
                value={data.totalReflections}
                duration={1500}
                style={styles.statValueHuge}
              />
            )}
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{data.totalMoments}</Text>
                <Text style={styles.statBoxLabel}>mestrings-{'\n'}momenter</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{data.streakWeeks}</Text>
                <Text style={styles.statBoxLabel}>uker på{'\n'}rad</Text>
              </View>
            </View>
            {data.totalReflections >= 10 && (
              <Text style={styles.funFact}>
                📝 Du er en ekte refleksjonstenker!
              </Text>
            )}
          </View>
        );

      case 'skills':
        return (
          <View style={styles.slideContent}>
            <Icon name="star" size={60} color={theme.colors.warning} />
            <Text style={styles.statLabel}>Ferdigheter mestret</Text>
            {isActive && (
              <AnimatedCounter
                value={data.totalSkills}
                duration={1500}
                style={styles.statValueHuge}
              />
            )}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[theme.colors.warning, '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${(data.totalSkills / data.maxSkills) * 100}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {data.totalSkills} av {data.maxSkills} ferdigheter
              </Text>
            </View>
            {data.skillsXP > 0 && (
              <Text style={styles.funFact}>
                ⚡ {data.skillsXP.toLocaleString()} XP fra ferdigheter!
              </Text>
            )}
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.slideContent}>
            <Icon name="trophy" size={60} color="#FFD700" />
            <Text style={styles.statLabel}>Prestasjoner låst opp</Text>
            {isActive && (
              <AnimatedCounter
                value={data.achievementCount}
                duration={1500}
                style={styles.statValueHuge}
              />
            )}
            {data.recentAchievements.length > 0 && (
              <View style={styles.achievementsList}>
                <Text style={styles.achievementsTitle}>Nylige prestasjoner:</Text>
                {data.recentAchievements.slice(0, 3).map((achievement, i) => (
                  <View key={i} style={styles.achievementItem}>
                    <Icon name={achievement.icon} size={20} color="#FFD700" />
                    <Text style={styles.achievementName}>{achievement.title}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'summary':
        return (
          <View style={styles.slideContent}>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[levelColors.primary, levelColors.secondary]}
                style={styles.summaryBadge}
              >
                <Icon name="sparkles" size={50} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.summaryTitle}>Fantastisk reise!</Text>
            <Text style={styles.summaryText}>
              Du er på nivå {data.level} som {data.levelName}.
              {'\n\n'}
              Hver dag er et nytt steg mot å bli den beste versjonen av deg selv.
              {'\n\n'}
              Fortsett å vandre! 🏔️
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.slideInner,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {renderContent()}
      </Animated.View>
    </View>
  );
};

export default function JourneyWrappedScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { 
    level = 1, 
    totalXP = 0, 
    stats = {}, 
    achievements = [],
    xpProgress = { progress: 0 },
  } = route.params || {};

  const levelColors = getLevelColors(level);
  const levelName = getLevelName(level);
  const animConfig = getLevelAnimationConfig(level);

  // Prepare slides data
  const slides = useMemo(() => [
    {
      type: 'welcome',
      level,
      levelName,
    },
    {
      type: 'xp',
      totalXP,
    },
    {
      type: 'trips',
      totalTrips: stats.totalTrips || 0,
      totalDistance: stats.totalTripDistance || 0,
      totalElevation: stats.totalTripElevation || 0,
    },
    // Only show pedometer slide if there are steps tracked
    ...(stats.todaySteps > 0 || stats.pedometerXP > 0 ? [{
      type: 'steps',
      todaySteps: stats.todaySteps || 0,
      pedometerXP: stats.pedometerXP || 0,
    }] : []),
    {
      type: 'reflections',
      totalReflections: stats.totalReflections || 0,
      totalMoments: stats.totalMoments || 0,
      streakWeeks: Math.floor((stats.currentStreak || 0) / 7),
    },
    {
      type: 'skills',
      totalSkills: stats.totalSkills || 0,
      maxSkills: 58, // Total skills available
      skillsXP: stats.skillsXP || 0,
    },
    {
      type: 'achievements',
      achievementCount: achievements.length,
      recentAchievements: achievements.slice(0, 5),
    },
    {
      type: 'summary',
      level,
      levelName,
    },
  ], [level, levelName, totalXP, stats, achievements]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToSlide = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const backgroundGradient = levelColors.background 
    ? [levelColors.background, '#000'] 
    : ['#0A0A0A', '#1A1A1A'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dot,
                  currentIndex === index && [
                    styles.dotActive,
                    { backgroundColor: levelColors.primary },
                  ],
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.closeButton} />
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Slide
            data={item}
            index={index}
            levelColors={levelColors}
            animConfig={animConfig}
            isActive={currentIndex === index}
          />
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Navigation hints */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => goToSlide(currentIndex + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>Neste</Text>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: levelColors.primary }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>Ferdig</Text>
            <Icon name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideInner: {
    width: '100%',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  levelBadgeLarge: {
    width: 140,
    height: 140,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  levelNumberLarge: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  levelNameLarge: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValueHuge: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 12,
  },
  xpValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 12,
  },
  xpValueLarge: {
    fontSize: 64,
    fontWeight: '900',
  },
  xpSuffix: {
    fontSize: 32,
    fontWeight: '800',
    marginLeft: 8,
  },
  statSubtext: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 120,
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statBoxLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
  funFact: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    marginTop: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementsList: {
    width: '100%',
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  achievementsTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  achievementName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  summaryBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  summaryTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});


import React from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';
import { getLevelName, getLevelColors, getLevelAnimationConfig } from '../utils/journeyUtils';

const isWeb = Platform.OS === 'web';

// RotatingStar component
const RotatingStar = ({ index, starAnim, colors, animConfig, rotateAnim }) => {
  const angle = (index * 360) / 8;
  const radius = 80;
  
  const rotateInterpolate = starAnim.rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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

export default function LevelCard({ 
  level, 
  totalXP, 
  xpProgress, 
  pulseAnim, 
  glowAnim, 
  rotateAnim, 
  starAnims 
}) {
  const colors = getLevelColors(level);
  const animConfig = getLevelAnimationConfig(level);
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.levelSection}>
      <View style={styles.levelCardContainer}>
        {/* Rotating stars around the card */}
        {animConfig.stars && starAnims.map((starAnim, index) => (
          <RotatingStar
            key={`star-${index}`}
            index={index}
            starAnim={starAnim}
            colors={colors}
            animConfig={animConfig}
            rotateAnim={rotateAnim}
          />
        ))}
        <Animated.View
          style={[
            styles.levelCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
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
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  levelGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  levelNumber: {
    ...theme.typography.h1,
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white,
  },
  badgeSparkle: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  levelSubLabel: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  xpText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpProgressContainer: {
    marginTop: theme.spacing.sm,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  xpProgressText: {
    alignItems: 'center',
  },
  xpProgressLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rotatingStar: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
});


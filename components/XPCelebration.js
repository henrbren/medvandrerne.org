import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Main XP Celebration Component - Simplified version without particles
export default function XPCelebration({ 
  visible, 
  xpAmount, 
  onComplete, 
  levelUp = false, 
  newLevel = null,
  celebrationType = 'normal',
}) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const [displayXP, setDisplayXP] = useState(0);
  const countValue = useRef(0);

  const getCelebrationConfig = () => {
    // Priority: celebrationType first, then xpAmount thresholds (lowered for more frequent celebrations)
    if (celebrationType === 'legendary' || xpAmount >= 200) {
      return {
        duration: 3500,
        gradient: ['#FFD700', '#FF6347', '#FF4500'],
        title: '🏆 LEGENDARISK!',
        subtitle: 'Du er en ekte mester!',
        icon: 'trophy',
      };
    } else if (celebrationType === 'epic' || xpAmount >= 100) {
      return {
        duration: 3000,
        gradient: ['#9B59B6', '#8E44AD', '#6C3483'],
        title: '⚡ EPISK!',
        subtitle: 'Fantastisk prestasjon!',
        icon: 'flash',
      };
    } else if (celebrationType === 'big' || xpAmount >= 50) {
      return {
        duration: 2500,
        gradient: ['#3498DB', '#2980B9', '#1ABC9C'],
        title: '🌟 FANTASTISK!',
        subtitle: 'Du gjør det flott!',
        icon: 'star',
      };
    } else {
      return {
        duration: 2000,
        gradient: [theme.colors.success, '#22C55E'],
        title: '✨ BRA JOBBA!',
        subtitle: 'Fortsett sånn!',
        icon: 'star',
      };
    }
  };

  useEffect(() => {
    // Show celebration for any XP amount, or always for level up
    if (visible && (xpAmount > 0 || levelUp)) {
      const config = getCelebrationConfig();
      setDisplayXP(0);
      countValue.current = 0;

      // Reset values
      overlayOpacity.setValue(0);
      xpScale.setValue(0);
      badgeScale.setValue(0);

      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      // Pop in XP badge after short delay
      setTimeout(() => {
        Animated.spring(xpScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }, 100);

      // Count up XP
      const countDuration = 1200;
      const steps = 30;
      const stepDuration = countDuration / steps;
      const increment = xpAmount / steps;
      
      let step = 0;
      const countInterval = setInterval(() => {
        step++;
        countValue.current = Math.min(Math.round(increment * step), xpAmount);
        setDisplayXP(countValue.current);
        
        if (step >= steps) {
          clearInterval(countInterval);
          setDisplayXP(xpAmount);
        }
      }, stepDuration);

      // Level up badge
      if (levelUp) {
        setTimeout(() => {
          Animated.spring(badgeScale, {
            toValue: 1,
            friction: 6,
            tension: 60,
            useNativeDriver: true,
          }).start();
        }, 600);
      }

      // Auto-dismiss
      const timeout = setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
        });
      }, config.duration);

      return () => {
        clearTimeout(timeout);
        clearInterval(countInterval);
      };
    } else if (!visible) {
      overlayOpacity.setValue(0);
      xpScale.setValue(0);
      badgeScale.setValue(0);
      setDisplayXP(0);
    }
  }, [visible, xpAmount]);

  if (!visible) return null;

  const config = getCelebrationConfig();

  return (
    <Animated.View 
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents="box-none"
    >
      {/* Main XP Badge */}
      <Animated.View
        style={[
          styles.xpContainer,
          { transform: [{ scale: xpScale }] },
        ]}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.xpBadge}
        >
          <View style={styles.xpInnerBadge}>
            <Icon name={config.icon} size={40} color="#FFD700" style={styles.xpIcon} />
            <Text style={styles.xpTitle}>{config.title}</Text>
            <View style={styles.xpValueContainer}>
              <Text style={styles.xpPlus}>+</Text>
              <Text style={styles.xpValue}>{displayXP}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
            <Text style={styles.xpSubtitle}>{config.subtitle}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Level Up Badge */}
      {levelUp && newLevel && (
        <Animated.View
          style={[
            styles.levelUpContainer,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.levelUpBadge}
          >
            <Icon name="arrow-up-circle" size={28} color={theme.colors.white} />
            <Text style={styles.levelUpText}>Nivå {newLevel}!</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Tap to dismiss */}
      <View style={styles.dismissHint}>
        <Text style={styles.dismissText}>Trykk for å lukke</Text>
      </View>
    </Animated.View>
  );
}

// Quick XP popup for smaller gains
export function QuickXPPopup({ visible, xpAmount, position = { x: width / 2, y: height / 2 } }) {
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      translateY.setValue(0);
      opacity.setValue(1);

      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);
    }
  }, [visible, xpAmount]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.quickPopup,
        {
          left: position.x - 40,
          top: position.y - 20,
          transform: [{ scale }, { translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[theme.colors.success, '#22C55E']}
        style={styles.quickPopupGradient}
      >
        <Text style={styles.quickPopupText}>+{xpAmount} XP</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  xpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    borderRadius: 24,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  xpInnerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  xpIcon: {
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 16,
    letterSpacing: 1,
  },
  xpValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  xpPlus: {
    fontSize: 36,
    fontWeight: '300',
    color: '#4ADE80',
    marginRight: 4,
  },
  xpValue: {
    fontSize: 64,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: -2,
  },
  xpLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 8,
  },
  xpSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
    opacity: 0.7,
    marginTop: 8,
  },
  levelUpContainer: {
    position: 'absolute',
    top: height * 0.28,
  },
  levelUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: '0 4px 24px rgba(255, 215, 0, 0.5)',
      },
    }),
  },
  levelUpText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.white,
  },
  dismissHint: {
    position: 'absolute',
    bottom: 50,
  },
  dismissText: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.5,
  },
  quickPopup: {
    position: 'absolute',
    zIndex: 9998,
  },
  quickPopupGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  quickPopupText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.white,
  },
});

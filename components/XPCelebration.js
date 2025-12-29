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
import * as Haptics from 'expo-haptics';
import Icon from './Icon';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Celebration text variations for different XP levels
const CELEBRATION_TEXTS = {
  legendary: [
    { title: '🏆 LEGENDARISK!', subtitle: 'Du er en ekte mester!' },
    { title: '👑 KONGEPOENG!', subtitle: 'Naturen bøyer seg for deg!' },
    { title: '🌟 SUPERHELTNIVÅ!', subtitle: 'Er du i det hele tatt menneskelig?!' },
    { title: '🔥 PÅ FYYYYR!', subtitle: 'Noen ring brannvesenet!' },
    { title: '💎 DIAMANT!', subtitle: 'Sjelden og verdifull!' },
    { title: '🚀 ROMFART!', subtitle: 'Houston, vi har en legende!' },
    { title: '⚡ GUDMODUS!', subtitle: 'Thor ville vært sjalu!' },
    { title: '🎯 BULLSEYE!', subtitle: 'Perfeksjon personifisert!' },
  ],
  epic: [
    { title: '⚡ EPISK!', subtitle: 'Fantastisk prestasjon!' },
    { title: '🔥 DU BRENNER!', subtitle: 'Ingen kan stoppe deg nå!' },
    { title: '💪 KRAFTPAKKE!', subtitle: 'Muskler og hjerne i harmoni!' },
    { title: '🌊 BØLGEN!', subtitle: 'Du surfer på toppen!' },
    { title: '🎸 ROCKESTJERNE!', subtitle: 'Naturen er din scene!' },
    { title: '⭐ SUPERSTJERNE!', subtitle: 'Du lyser opp skogen!' },
    { title: '🏔️ FJELLGEIT!', subtitle: 'Ingen topp er for høy!' },
    { title: '🦅 ØRNEØYE!', subtitle: 'Du ser alt og mestrer alt!' },
  ],
  big: [
    { title: '🌟 FANTASTISK!', subtitle: 'Du gjør det flott!' },
    { title: '💫 IMPONERENDE!', subtitle: 'Bare fortsett sånn!' },
    { title: '🎉 PARTY!', subtitle: 'Feiring er på sin plass!' },
    { title: '🌈 REGNBUE!', subtitle: 'Fargerik innsats!' },
    { title: '🍀 HELDIG!', subtitle: 'Eller er det bare talent?' },
    { title: '🎯 TREFF!', subtitle: 'Rett i blinken!' },
    { title: '🌲 SKOGSMESTER!', subtitle: 'Naturen elsker deg!' },
    { title: '🦊 LUSANSEN!', subtitle: 'Smart og rask!' },
  ],
  normal: [
    { title: '✨ BRA JOBBA!', subtitle: 'Fortsett sånn!' },
    { title: '👍 NICE!', subtitle: 'Hvert skritt teller!' },
    { title: '🌿 GRØNT LYS!', subtitle: 'Du er på rett vei!' },
    { title: '🚶 STEGVIS!', subtitle: 'Små skritt, stor fremgang!' },
    { title: '💚 HJERTE!', subtitle: 'Naturen setter pris på deg!' },
    { title: '🌱 VEKST!', subtitle: 'Du blomstrer!' },
    { title: '⚡ ENERGI!', subtitle: 'La den flyte!' },
    { title: '🎈 OPPTUR!', subtitle: 'Bare oppover herfra!' },
    { title: '🐿️ EKORNENERGI!', subtitle: 'Samler poeng som nøtter!' },
    { title: '🦔 PIGGSVIN!', subtitle: 'Liten men tøff!' },
  ],
};

// Level up text variations
const LEVEL_UP_TEXTS = [
  { title: '🎊 NIVÅ OPP!', subtitle: 'Du har nådd nye høyder!' },
  { title: '🆙 LEVEL UP!', subtitle: 'Neste kapittel begynner!' },
  { title: '🏅 FORFREMMET!', subtitle: 'Du klatrer oppover!' },
  { title: '🌟 OPPGRADERING!', subtitle: 'Ny og forbedret versjon!' },
  { title: '🚀 AVANSERT!', subtitle: 'Ingenting stopper deg!' },
  { title: '👆 NESTE NIVÅ!', subtitle: 'Himmelens grensen!' },
  { title: '🎖️ RANGERT OPP!', subtitle: 'Respekt!' },
  { title: '⬆️ STIGNING!', subtitle: 'Du flyr høyt nå!' },
];

// Helper to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

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
  // Store the random texts so they don't change during animation
  const celebrationText = useRef(null);
  const levelUpText = useRef(null);

  const getCelebrationConfig = () => {
    // Get random text for this celebration (only once per celebration)
    if (!celebrationText.current) {
      if (celebrationType === 'legendary' || xpAmount >= 200) {
        celebrationText.current = getRandomItem(CELEBRATION_TEXTS.legendary);
      } else if (celebrationType === 'epic' || xpAmount >= 100) {
        celebrationText.current = getRandomItem(CELEBRATION_TEXTS.epic);
      } else if (celebrationType === 'big' || xpAmount >= 50) {
        celebrationText.current = getRandomItem(CELEBRATION_TEXTS.big);
      } else {
        celebrationText.current = getRandomItem(CELEBRATION_TEXTS.normal);
      }
    }
    
    const text = celebrationText.current;
    
    // Priority: celebrationType first, then xpAmount thresholds (lowered for more frequent celebrations)
    if (celebrationType === 'legendary' || xpAmount >= 200) {
      return {
        duration: 3500,
        gradient: ['#FFD700', '#FF6347', '#FF4500'],
        title: text.title,
        subtitle: text.subtitle,
        icon: 'trophy',
      };
    } else if (celebrationType === 'epic' || xpAmount >= 100) {
      return {
        duration: 3000,
        gradient: ['#9B59B6', '#8E44AD', '#6C3483'],
        title: text.title,
        subtitle: text.subtitle,
        icon: 'flash',
      };
    } else if (celebrationType === 'big' || xpAmount >= 50) {
      return {
        duration: 2500,
        gradient: ['#3498DB', '#2980B9', '#1ABC9C'],
        title: text.title,
        subtitle: text.subtitle,
        icon: 'star',
      };
    } else {
      return {
        duration: 2000,
        gradient: [theme.colors.success, '#22C55E'],
        title: text.title,
        subtitle: text.subtitle,
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

      // Initial haptic feedback based on celebration type
      if (Platform.OS !== 'web') {
        if (celebrationType === 'legendary' || xpAmount >= 200) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (celebrationType === 'epic' || xpAmount >= 100) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (celebrationType === 'big' || xpAmount >= 50) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      // Pop in XP badge after short delay
      setTimeout(() => {
        // Haptic for badge pop
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Animated.spring(xpScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }, 100);

      // Count up XP with haptic pulses
      const countDuration = 1200;
      const steps = 30;
      const stepDuration = countDuration / steps;
      const increment = xpAmount / steps;
      const hapticInterval = Math.ceil(steps / 6); // Haptic every ~5 steps
      
      let step = 0;
      const countInterval = setInterval(() => {
        step++;
        countValue.current = Math.min(Math.round(increment * step), xpAmount);
        setDisplayXP(countValue.current);
        
        // Light haptic pulse during counting
        if (Platform.OS !== 'web' && step % hapticInterval === 0) {
          Haptics.selectionAsync();
        }
        
        if (step >= steps) {
          clearInterval(countInterval);
          setDisplayXP(xpAmount);
          // Final haptic when count completes
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }, stepDuration);

      // Level up badge
      if (levelUp) {
        setTimeout(() => {
          // Strong haptic for level up
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
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
      // Reset text refs so we get new random texts next time
      celebrationText.current = null;
      levelUpText.current = null;
    }
  }, [visible, xpAmount, celebrationType, levelUp]);

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
      {levelUp && newLevel && (() => {
        // Get random level up text (only once per celebration)
        if (!levelUpText.current) {
          levelUpText.current = getRandomItem(LEVEL_UP_TEXTS);
        }
        const lvlText = levelUpText.current;
        
        return (
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
              <Text style={styles.levelUpTitle}>{lvlText.title}</Text>
              <Text style={styles.levelUpLevel}>Nivå {newLevel}</Text>
              <Text style={styles.levelUpSubtitle}>{lvlText.subtitle}</Text>
            </LinearGradient>
          </Animated.View>
        );
      })()}

      {/* Tap to dismiss */}
      <View style={styles.dismissHint}>
        <Text style={styles.dismissText}>Trykk for å lukke</Text>
      </View>
    </Animated.View>
  );
}

// Quick XP popup for smaller gains - always shows centered at top of screen
export function QuickXPPopup({ visible, xpAmount }) {
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      translateY.setValue(0);
      opacity.setValue(1);

      // Light haptic for quick popup
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
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
        styles.quickPopupContainer,
        {
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
    bottom: height * 0.22, // Position below the centered XP card
  },
  levelUpBadge: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    minWidth: 180,
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
  levelUpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 4,
  },
  levelUpLevel: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.white,
    marginBottom: 4,
  },
  levelUpSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  quickPopupContainer: {
    position: 'absolute',
    top: 100, // Safe distance from top (below status bar and headers)
    left: 0,
    right: 0,
    alignItems: 'center',
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

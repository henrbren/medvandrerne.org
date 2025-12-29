import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getLevelColors, getLevelAnimationConfig } from '../utils/journeyUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Animated background stripes that reflect user's level
 * Features:
 * - Stripes color matches level theme
 * - "Boost" mode intensifies animation when XP is gained
 * - "Idle" mode is more subtle/diffuse when just viewing
 */
export default function LevelBackground({ 
  level = 1, 
  boosted = false,  // Set to true briefly when XP is gained
  style,
}) {
  const colors = getLevelColors(level || 1);
  const animConfig = getLevelAnimationConfig(level || 1);
  
  // Boost animation value (0 = idle, 1 = boosted)
  const boostAnim = useRef(new Animated.Value(0)).current;
  
  // Create animated values for each stripe
  const stripeAnims = useRef(
    Array.from({ length: 10 }, () => ({
      translateX: new Animated.Value(-SCREEN_WIDTH),
      opacity: new Animated.Value(0),
    }))
  ).current;
  
  // Glow animation for high levels
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Handle boost state changes
  useEffect(() => {
    if (boosted) {
      // Animate to boosted state
      Animated.timing(boostAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-fade back to idle after 2 seconds
      const timeout = setTimeout(() => {
        Animated.timing(boostAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 2000);
      
      return () => clearTimeout(timeout);
    } else {
      Animated.timing(boostAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [boosted]);
  
  // Start stripe animations
  useEffect(() => {
    const stripeAnimations = stripeAnims.map((anim, index) => {
      const delay = index * 200;
      const duration = 3000 + (index * 400);
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.translateX, {
              toValue: SCREEN_WIDTH * 2,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: duration * 0.25,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: duration * 0.75,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(anim.translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    // Glow animation for high levels
    const glowAnimation = animConfig.glow ? Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ) : null;
    
    stripeAnimations.forEach(anim => anim.start());
    if (glowAnimation) glowAnimation.start();
    
    return () => {
      stripeAnimations.forEach(anim => anim.stop());
      if (glowAnimation) glowAnimation.stop();
    };
  }, [level]);
  
  // Stripe configurations - different positions and angles
  const stripeConfigs = [
    { top: '5%', width: SCREEN_WIDTH * 1.6, height: 2, angle: -5 },
    { top: '12%', width: SCREEN_WIDTH * 1.4, height: 3, angle: 6 },
    { top: '22%', width: SCREEN_WIDTH * 1.5, height: 2, angle: -4 },
    { top: '35%', width: SCREEN_WIDTH * 1.3, height: 4, angle: 8 },
    { top: '48%', width: SCREEN_WIDTH * 1.7, height: 2, angle: -7 },
    { top: '58%', width: SCREEN_WIDTH * 1.4, height: 3, angle: 5 },
    { top: '70%', width: SCREEN_WIDTH * 1.5, height: 2, angle: -3 },
    { top: '80%', width: SCREEN_WIDTH * 1.6, height: 4, angle: 6 },
    { top: '88%', width: SCREEN_WIDTH * 1.3, height: 2, angle: -6 },
    { top: '95%', width: SCREEN_WIDTH * 1.5, height: 3, angle: 4 },
  ];
  
  // Calculate opacity based on boost state
  // Idle: 0.15-0.25, Boosted: 0.4-0.6
  const baseOpacity = boostAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.5],
  });
  
  // Glow opacity
  const glowOpacity = Animated.multiply(
    glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.12],
    }),
    boostAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.5], // Boost increases glow
    })
  );
  
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {/* Background glow for high levels */}
      {animConfig.glow && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { 
              backgroundColor: colors.glow, 
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      
      {/* Animated stripes */}
      {stripeAnims.map((anim, index) => {
        const config = stripeConfigs[index];
        
        // Combine stripe opacity with boost multiplier
        const stripeOpacity = Animated.multiply(anim.opacity, baseOpacity);
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.stripe,
              {
                top: config.top,
                width: config.width,
                height: config.height * 2.5,
                transform: [
                  { translateX: anim.translateX },
                  { rotate: `${config.angle}deg` },
                ],
                opacity: stripeOpacity,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                colors.primary + '40',
                colors.secondary + '80',
                colors.primary + '40',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        );
      })}
      
      {/* Subtle radial glow at center when boosted */}
      <Animated.View
        style={[
          styles.centerGlow,
          {
            backgroundColor: colors.primary,
            opacity: boostAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    position: 'absolute',
    left: -100,
    overflow: 'hidden',
  },
  centerGlow: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: SCREEN_HEIGHT * 0.3,
    borderRadius: SCREEN_HEIGHT * 0.15,
  },
});


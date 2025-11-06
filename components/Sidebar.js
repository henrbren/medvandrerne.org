import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

const menuItems = [
  { name: 'Hjem', icon: 'home', route: 'Hjem', color: theme.colors.primary },
  { name: 'Aktiviteter', icon: 'calendar', route: 'Aktiviteter', color: theme.colors.primaryLight },
  { name: 'Lokallag', icon: 'people', route: 'Lokallag', color: theme.colors.secondary },
  { name: 'Om oss', icon: 'information-circle', route: 'Om oss', color: theme.colors.accent },
  { name: 'Kontakt', icon: 'call', route: 'Kontakt', color: theme.colors.primary },
];

export default function Sidebar({ navigation, currentRoute }) {
  if (!isWeb) return null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sidebarHeader}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Ionicons name="walk" size={32} color={theme.colors.white} />
          </View>
          <Text style={styles.logoText}>Medvandrerne</Text>
          <Text style={styles.logoSubtext}>Vi vandrer sammen</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const isActive = currentRoute === item.route;
          
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.8}
            >
              {isActive && (
                <LinearGradient
                  colors={[item.color + '20', item.color + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeIndicator}
                />
              )}
              <View style={[styles.menuIconContainer, isActive && styles.menuIconContainerActive]}>
                {isActive ? (
                  <LinearGradient
                    colors={[item.color, item.color + 'DD']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name={item.icon} size={22} color={theme.colors.white} />
                  </LinearGradient>
                ) : (
                  <Ionicons
                    name={`${item.icon}-outline`}
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                )}
              </View>
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {item.name}
              </Text>
              {isActive && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <LinearGradient
          colors={[theme.colors.primary + '15', theme.colors.primaryLight + '10']}
          style={styles.footerGradient}
        >
          <Ionicons name="heart" size={20} color={theme.colors.primary} />
          <Text style={styles.footerText}>Stiftelsen Medvandrerne</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 300,
    backgroundColor: theme.colors.backgroundElevated,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    ...theme.shadows.large,
    zIndex: 1000,
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  logoText: {
    ...theme.typography.h2,
    color: theme.colors.white,
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
    fontStyle: 'italic',
    fontSize: 14,
  },
  menuContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  menuIconContainerActive: {
    backgroundColor: 'transparent',
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  menuText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  menuTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  sidebarFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  footerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});


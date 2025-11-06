import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { SAMPLE_ACTIVITIES } from '../constants/data';
import { useRegistrations } from '../hooks/useRegistrations';

const isWeb = Platform.OS === 'web';

export default function MyRegistrationsScreen({ navigation }) {
  const { registrations, loading, loadRegistrations, unregisterFromActivity } = useRegistrations();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Refresh registrations when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get registered activities
  const registeredActivities = SAMPLE_ACTIVITIES.filter(activity => 
    registrations.includes(activity.id)
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Tur':
        return 'walk';
      case 'Motivasjonstur':
        return 'map';
      case 'Møte':
        return 'people';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar';
    }
  };

  const handleUnregister = (activity) => {
    Alert.alert(
      'Avmeld aktivitet',
      `Er du sikker på at du vil avmelde deg fra "${activity.title}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Avmeld',
          style: 'destructive',
          onPress: async () => {
            await unregisterFromActivity(activity.id);
            Alert.alert('Avmeldt', 'Du er nå avmeldt fra aktiviteten');
          },
        },
      ]
    );
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
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <View style={styles.heroImageContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIconContainer}>
                <Icon name="checkmark-circle" size={48} color={theme.colors.white} />
              </View>
              <Text style={styles.heroTitle}>Mine påmeldinger</Text>
              <Text style={styles.heroSubtitle}>
                {registeredActivities.length === 0
                  ? 'Ingen påmeldinger'
                  : `${registeredActivities.length} ${registeredActivities.length === 1 ? 'aktivitet' : 'aktiviteter'}`
                }
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Registrations List */}
        {registeredActivities.length > 0 ? (
          <Animated.View style={[styles.activitiesSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Påmeldte aktiviteter</Text>
            </View>
            <View style={styles.activitiesList}>
              {registeredActivities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <TouchableOpacity
                    style={styles.activityCardContent}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ActivityDetail', { activity })}
                  >
                    <View style={styles.activityIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryLight]}
                        style={styles.activityIconGradient}
                      >
                        <Icon
                          name={getActivityIcon(activity.type)}
                          size={28}
                          color={theme.colors.white}
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <View style={styles.activityMeta}>
                        <View style={styles.activityBadge}>
                          <Text style={styles.activityType}>{activity.type}</Text>
                        </View>
                        <Text style={styles.activityTime}>
                          {activity.multiDay
                            ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                            : `${formatDate(activity.date)}${activity.time ? ` • ${activity.time}` : ''}`
                          }
                        </Text>
                      </View>
                      {activity.location && activity.location !== 'Har ikke sted' && (
                        <View style={styles.activityLocation}>
                          <Icon name="location" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.activityLocationText}>{activity.location}</Text>
                        </View>
                      )}
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.unregisterButton}
                    onPress={() => handleUnregister(activity)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close-circle" size={20} color={theme.colors.error} />
                    <Text style={styles.unregisterText}>Avmeld</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <View style={styles.emptyIconContainer}>
              <Icon name="calendar-outline" size={80} color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Ingen påmeldinger</Text>
            <Text style={styles.emptyText}>
              Du er ikke påmeldt noen aktiviteter ennå.{'\n'}
              Gå til aktivitetskalenderen for å melde deg på.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Aktiviteter')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Icon name="calendar" size={24} color={theme.colors.white} />
                <Text style={styles.ctaText}>Se aktiviteter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

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
  
  // Hero Section
  heroSection: {
    marginBottom: theme.spacing.xxxl,
  },
  heroImageContainer: {
    width: '100%',
  },
  heroGradient: {
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.large,
  },
  heroTitle: {
    ...theme.typography.h1,
    fontSize: isWeb ? 32 : 28,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    ...theme.typography.body,
    fontSize: 18,
    color: theme.colors.white,
    opacity: 0.95,
  },
  
  // Activities Section
  activitiesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
  },
  activitiesList: {
    gap: theme.spacing.lg,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  activityCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  activityIconContainer: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIconGradient: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  activityBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  activityTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  activityLocationText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  unregisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.error + '10',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  unregisterText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '700',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  ctaText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});


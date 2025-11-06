import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params;

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 600 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const formatDate = (dateString) => {
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
        return 'people-outline';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar-outline';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Header */}
        <Animated.View style={[styles.heroSection, headerStyle]}>
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroIconContainer}>
              <Icon
                name={getActivityIcon(activity.type)}
                size={48}
                color={theme.colors.white}
              />
            </View>
            <Text style={styles.heroTitle}>{activity.title}</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{activity.type}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Details */}
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="time-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Tidspunkt</Text>
            </View>
            <Text style={styles.detailText}>
              {activity.multiDay
                ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                : `${formatDate(activity.date)} kl. ${activity.time}`}
            </Text>
          </View>

          {activity.location !== 'Har ikke sted' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconWrapper}>
                  <Icon name="location-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Sted</Text>
              </View>
              <Text style={styles.detailText}>{activity.location}</Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="information-circle-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Om aktiviteten</Text>
            </View>
            <Text style={styles.descriptionText}>
              {activity.description || 
                'Dette er en spennende aktivitet arrangert av Medvandrerne. ' +
                'Vi inviterer deg til å være med på en opplevelse som gir muligheter ' +
                'for vekst, mestring og fellesskap i naturen.'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => {
              // Could open calendar or share
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Icon name="calendar-outline" size={24} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Legg til i kalender</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: theme.spacing.xl,
  },
  heroSection: {
    marginBottom: theme.spacing.lg,
  },
  heroGradient: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: 28,
  },
  heroBadge: {
    backgroundColor: theme.colors.white + '30',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  heroBadgeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700',
  },
  contentSection: {
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  detailText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    fontSize: 16,
  },
  actionButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.large,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  actionButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 18,
    marginLeft: theme.spacing.sm,
  },
});


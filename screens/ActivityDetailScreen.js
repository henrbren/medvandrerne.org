import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function ActivityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params;

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: theme.animations.normal });
    slideAnim.value = withSpring(0, theme.animations.spring);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
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
        return 'people';
      case 'Arrangement':
        return 'trophy';
      default:
        return 'calendar';
    }
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
        {/* Hero Header */}
        <Animated.View style={[styles.heroWrapper, headerStyle]}>
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
            
            {/* Decorative elements */}
            <View style={styles.heroDecoration1} />
            <View style={styles.heroDecoration2} />
          </LinearGradient>
        </Animated.View>

        {/* Details */}
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <View style={styles.detailsSection}>
            <View style={styles.detailCard}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Icon name="time" size={28} color={theme.colors.info} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tidspunkt</Text>
                <Text style={styles.detailValue}>
                  {activity.multiDay
                    ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                    : `${formatDate(activity.date)}, kl. ${activity.time}`}
                </Text>
              </View>
            </View>

            {activity.location !== 'Har ikke sted' && (
              <View style={styles.detailCard}>
                <View style={[styles.detailIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="location" size={28} color={theme.colors.success} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Sted</Text>
                  <Text style={styles.detailValue}>{activity.location}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <Icon name="information-circle" size={28} color={theme.colors.primary} />
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
            style={styles.actionCTA}
            activeOpacity={0.85}
            onPress={() => {
              // Could open calendar or share
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCTAGradient}
            >
              <View style={styles.ctaIconContainer}>
                <Icon name="calendar" size={28} color={theme.colors.white} />
              </View>
              <Text style={styles.ctaText}>Legg til i kalender</Text>
              <Icon name="arrow-forward" size={24} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>
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
  
  // Hero Section
  heroWrapper: {
    marginBottom: theme.spacing.xxxl,
  },
  heroGradient: {
    paddingVertical: theme.spacing.xxxl * 1.5,
    paddingHorizontal: theme.spacing.xl,
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  heroIconContainer: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
    zIndex: 2,
  },
  heroTitle: {
    ...theme.typography.display,
    fontSize: isWeb ? 48 : 36,
    fontWeight: '900',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  heroBadge: {
    backgroundColor: theme.colors.white + '30',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    zIndex: 2,
  },
  heroBadgeText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
  },
  heroDecoration1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.white + '15',
    top: -50,
    right: -50,
    zIndex: 1,
  },
  heroDecoration2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.white + '10',
    bottom: -30,
    left: -30,
    zIndex: 1,
  },
  
  // Content Section
  contentSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
  },
  detailsSection: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  detailCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
    alignItems: 'center',
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    lineHeight: 26,
  },
  
  // Description Section
  descriptionSection: {
    marginBottom: theme.spacing.xxxl,
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
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 28,
  },
  
  // Action CTA
  actionCTA: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
    marginBottom: theme.spacing.xl,
  },
  actionCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    flex: 1,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

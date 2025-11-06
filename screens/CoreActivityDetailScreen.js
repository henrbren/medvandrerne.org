import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

export default function CoreActivityDetailScreen() {
  const route = useRoute();
  const { activity } = route.params;

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 600 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const AnimatedCard = ({ children, delay = 0 }) => {
    const cardFade = useSharedValue(0);
    const cardSlide = useSharedValue(30);

    useEffect(() => {
      cardFade.value = withDelay(delay, withTiming(1, { duration: 500 }));
      cardSlide.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    }, []);

    const cardStyle = useAnimatedStyle(() => ({
      opacity: cardFade.value,
      transform: [{ translateY: cardSlide.value }],
    }));

    return (
      <Animated.View style={cardStyle}>
        {children}
      </Animated.View>
    );
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
              <Icon name={activity.icon} size={48} color={theme.colors.white} />
            </View>
            <Text style={styles.heroTitle}>{activity.title}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Description */}
        <AnimatedCard delay={100}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="information-circle-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Om aktiviteten</Text>
            </View>
            <Text style={styles.descriptionText}>{activity.description}</Text>
          </View>
        </AnimatedCard>

        {/* Additional Info */}
        <AnimatedCard delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="heart-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Viktig for Medvandrerne</Text>
            </View>
            <Text style={styles.descriptionText}>
              Dette er en av våre kjerneaktiviteter som er sentral i Medvandrernes 
              virksomhet. Gjennom denne aktiviteten skaper vi muligheter for vekst, 
              mestring og fellesskap i naturen.
            </Text>
          </View>
        </AnimatedCard>

        {/* Impact */}
        <AnimatedCard delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="trophy-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Effekt</Text>
            </View>
            <Text style={styles.descriptionText}>
              Gjennom denne aktiviteten får deltakerne mulighet til å oppleve 
              salutogenese og recovery, hvor fokuset ligger på det som gjør den 
              enkelte frisk. Naturen spiller en sentral rolle, og deltakerne får 
              økt selvtillit og mestringsfølelse som de kan ta med seg tilbake til hverdagen.
            </Text>
          </View>
        </AnimatedCard>
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
    fontSize: 28,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
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
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    fontSize: 16,
  },
});


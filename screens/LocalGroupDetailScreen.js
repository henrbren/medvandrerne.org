import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
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

export default function LocalGroupDetailScreen() {
  const route = useRoute();
  const { group } = route.params;

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

  const handlePhonePress = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleFacebookPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

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
              <Icon name="people" size={48} color={theme.colors.white} />
            </View>
            <Text style={styles.heroTitle}>{group.name}</Text>
            <Text style={styles.heroSubtitle}>Lokallag</Text>
          </LinearGradient>
        </Animated.View>

        {/* Contact Information */}
        <AnimatedCard delay={100}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="people-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Kontaktinformasjon</Text>
            </View>

            {group.coordinator && (
              <View style={styles.contactRow}>
                <View style={styles.contactIconContainer}>
                  <Icon name="person-outline" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Koordinator</Text>
                  <Text style={styles.contactValue}>{group.coordinator}</Text>
                </View>
              </View>
            )}

            {group.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => handlePhonePress(group.phone)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name="call-outline" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Telefon</Text>
                  <Text style={styles.contactLink}>{group.phone}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}

            {group.email && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => handleEmailPress(group.email)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name="mail-outline" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>E-post</Text>
                  <Text style={styles.contactLink}>{group.email}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </AnimatedCard>

        {/* Facebook Group */}
        {group.facebook && (
          <AnimatedCard delay={200}>
            <TouchableOpacity
              style={styles.facebookButton}
              onPress={() => handleFacebookPress(group.facebook)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1877F2', '#42A5F5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.facebookButtonGradient}
              >
                <View style={styles.facebookIconContainer}>
                  <Icon name="logo-facebook" size={28} color={theme.colors.white} />
                </View>
                <View style={styles.facebookContent}>
                  <Text style={styles.facebookTitle}>Facebook-gruppe</Text>
                  <Text style={styles.facebookSubtitle}>Bli med i gruppen</Text>
                </View>
                <Icon name="chevron-forward-outline" size={24} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedCard>
        )}

        {/* About Section */}
        <AnimatedCard delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="information-circle-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Om lokallaget</Text>
            </View>
            <Text style={styles.descriptionText}>
              {group.name} lokallag arrangerer faste turer minst en dag i uken. 
              I tillegg postes det sosiale arrangementer og invitasjoner til større 
              aktiviteter som motivasjonsturer, miljøaksjoner og deltakelse på større 
              sports- og kulturarrangementer.
            </Text>
            <Text style={styles.descriptionText}>
              Alle er velkommen til å være med! Ta kontakt med koordinatoren eller 
              bli med i Facebook-gruppen for å få oppdateringer om kommende aktiviteter.
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
    marginBottom: theme.spacing.xs,
    fontSize: 32,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: 18,
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  contactValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  contactLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  facebookButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
  },
  facebookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  facebookIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  facebookContent: {
    flex: 1,
  },
  facebookTitle: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  facebookSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
});


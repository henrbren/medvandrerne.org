import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function PersonDetailScreen({ route, navigation }) {
  const { person, type } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!person) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen informasjon tilgjengelig</Text>
      </View>
    );
  }

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
        <Animated.View style={[styles.heroWrapper, { opacity: fadeAnim }]}>
          {person.image ? (
            <View style={styles.heroImageContainer}>
              <Image 
                source={person.image} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroImageOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroName}>{person.name}</Text>
                {person.role && (
                  <Text style={styles.heroRole}>{person.role}</Text>
                )}
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={[
                theme.colors.gradientStart,
                theme.colors.gradientMiddle,
                theme.colors.gradientEnd,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Icon
                    name="person-circle"
                    size={56}
                    color={theme.colors.white}
                  />
                </View>
              </View>
              <Text style={styles.heroName}>{person.name}</Text>
              {person.role && (
                <Text style={styles.heroRole}>{person.role}</Text>
              )}
              
              {/* Decorative elements */}
              <View style={styles.heroDecoration1} />
              <View style={styles.heroDecoration2} />
            </LinearGradient>
          )}
        </Animated.View>

        {/* Contact Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.headerIconGradient}
            >
              <Icon name="call" size={32} color={theme.colors.white} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Kontakt</Text>
          </View>

          <View style={styles.ctaContainer}>
            {person.phone && (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handlePhonePress(person.phone)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGradient}
                >
                  <View style={styles.ctaIconContainer}>
                    <Icon name="call" size={28} color={theme.colors.white} />
                  </View>
                  <Text style={styles.ctaText}>Ring {person.name.split(' ')[0]}</Text>
                  <Icon name="arrow-forward" size={24} color={theme.colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {person.email && (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handleEmailPress(person.email)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGradient}
                >
                  <View style={styles.ctaIconContainer}>
                    <Icon name="mail" size={28} color={theme.colors.white} />
                  </View>
                  <Text style={styles.ctaText}>Send e-post</Text>
                  <Icon name="arrow-forward" size={24} color={theme.colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle" size={28} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Informasjon</Text>
          </View>

          <View style={styles.infoCard}>
            {person.role && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="briefcase" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Rolle</Text>
                  <Text style={styles.infoValue}>{person.role}</Text>
                </View>
              </View>
            )}

            {person.phone && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="call" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefon</Text>
                  <Text style={styles.infoValue}>{person.phone}</Text>
                </View>
              </View>
            )}

            {person.email && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="mail" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>E-post</Text>
                  <Text style={styles.infoValue}>{person.email}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Additional CTA Section */}
        {type === 'administration' && (
          <View style={styles.involvementSection}>
            <View style={styles.sectionHeader}>
              <Icon name="people" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Bli involvert</Text>
            </View>
            <Text style={styles.ctaDescription}>
              Ønsker du å bidra til Medvandrernes arbeid? Ta kontakt med{' '}
              {person.name.split(' ')[0]} for å høre mer om hvordan du kan være med.
            </Text>
            {person.email && (
              <TouchableOpacity
                style={styles.secondaryCtaButton}
                onPress={() => handleEmailPress(person.email)}
                activeOpacity={0.7}
              >
                <Icon name="mail" size={22} color={theme.colors.primary} />
                <Text style={styles.secondaryCtaText}>
                  Send en henvendelse
                </Text>
                <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
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
    paddingTop: theme.spacing.xl,
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
    marginBottom: theme.spacing.xl,
  },
  heroImageContainer: {
    width: '100%',
    height: 180,
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.glow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    zIndex: 2,
  },
  heroGradient: {
    paddingVertical: theme.spacing.xl + theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
    zIndex: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white + '40',
    ...theme.shadows.small,
  },
  heroName: {
    ...theme.typography.h2,
    fontSize: isWeb ? 24 : 22,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'left',
    marginBottom: theme.spacing.xs / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroRole: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.95,
    fontSize: 16,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
  
  // Sections
  section: {
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  infoSection: {
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  involvementSection: {
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowSubtle,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
  },
  
  // CTA Container
  ctaContainer: {
    gap: theme.spacing.lg,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  ctaGradient: {
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
  
  // Info Card
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  
  // Secondary CTA
  ctaDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
  },
  secondaryCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  secondaryCtaText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

export default function LocalGroupDetailScreen({ route, navigation }) {
  const { group } = route.params || {};

  if (!group) {
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

  const handleFacebookPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const isWeb = Platform.OS === 'web';

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
        <View style={styles.heroSection}>
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
            <View style={styles.iconContainer}>
              <Icon name="people" size={60} color={theme.colors.white} />
            </View>
            <Text style={styles.heroName}>{group.name}</Text>
            <Text style={styles.heroSubtitle}>Lokallag</Text>
          </LinearGradient>
        </View>

        {/* Coordinator Info */}
        {group.coordinator && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="person" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Koordinator</Text>
            </View>
            <View style={styles.coordinatorCard}>
              <View style={styles.coordinatorAvatar}>
                <Icon
                  name="person-circle-outline"
                  size={50}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.coordinatorInfo}>
                <Text style={styles.coordinatorName}>{group.coordinator}</Text>
                {group.phone && (
                  <TouchableOpacity
                    onPress={() => handlePhonePress(group.phone)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.coordinatorContact}>
                      {group.phone}
                    </Text>
                  </TouchableOpacity>
                )}
                {group.email && (
                  <TouchableOpacity
                    onPress={() => handleEmailPress(group.email)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.coordinatorContact}>
                      {group.email}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Contact CTAs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="call" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Kontakt</Text>
          </View>

          {group.phone && (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handlePhonePress(group.phone)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  theme.colors.primaryDark,
                  theme.colors.primary,
                  theme.colors.primaryLight,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Icon name="call-outline" size={24} color={theme.colors.white} />
                <Text style={styles.ctaText}>Ring koordinator</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {group.email && (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handleEmailPress(group.email)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  theme.colors.primaryDark,
                  theme.colors.primary,
                  theme.colors.primaryLight,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Icon name="mail-outline" size={24} color={theme.colors.white} />
                <Text style={styles.ctaText}>Send e-post</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {group.facebook && (
            <TouchableOpacity
              style={styles.facebookCtaButton}
              onPress={() => handleFacebookPress(group.facebook)}
              activeOpacity={0.8}
            >
              <View style={styles.facebookCtaContent}>
                <Icon name="logo-facebook" size={24} color="#1877F2" />
                <Text style={styles.facebookCtaText}>
                  Gå til Facebook-gruppe
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Join CTA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="people-circle" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Bli med</Text>
          </View>
          <Text style={styles.joinDescription}>
            {group.name} arrangerer faste turer minst en dag i uken. I tillegg
            postes det sosiale arrangementer og invitasjoner til større
            aktiviteter som motivasjonsturer, miljøaksjoner og deltakelse på
            større sports- og kulturarrangementer.
          </Text>
          {group.facebook && (
            <TouchableOpacity
              style={styles.joinCtaButton}
              onPress={() => handleFacebookPress(group.facebook)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1877F2', '#42A5F5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.joinCtaGradient}
              >
                <Icon name="logo-facebook" size={24} color={theme.colors.white} />
                <Text style={styles.joinCtaText}>
                  Bli med i Facebook-gruppen
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {group.coordinator && (
            <Text style={styles.joinNote}>
              Ta kontakt med {group.coordinator} for mer informasjon om
              aktiviteter i {group.name}.
            </Text>
          )}
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon
                name="information-circle"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.sectionTitle}>Informasjon</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="people" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lokallag</Text>
                <Text style={styles.infoValue}>{group.name}</Text>
              </View>
            </View>

            {group.coordinator && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon
                    name="person-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Koordinator</Text>
                  <Text style={styles.infoValue}>{group.coordinator}</Text>
                </View>
              </View>
            )}

            {group.phone && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon
                    name="call-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefon</Text>
                  <Text style={styles.infoValue}>{group.phone}</Text>
                </View>
              </View>
            )}

            {group.email && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon
                    name="mail-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>E-post</Text>
                  <Text style={styles.infoValue}>{group.email}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

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
  heroSection: {
    marginBottom: theme.spacing.xxxl,
  },
  heroGradient: {
    paddingVertical: theme.spacing.xxxl * 1.5,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    marginHorizontal: Platform.OS === 'web' ? 0 : theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: theme.colors.white + '40',
  },
  heroName: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.95,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: Platform.OS === 'web' ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  iconWrapper: {
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
  coordinatorCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  coordinatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  coordinatorInfo: {
    flex: 1,
  },
  coordinatorName: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  coordinatorContact: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.xl,
    ...theme.shadows.glow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  ctaText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 18,
    marginLeft: theme.spacing.sm,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  facebookCtaButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#1877F2',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  facebookCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  facebookCtaText: {
    ...theme.typography.body,
    color: '#1877F2',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: theme.spacing.sm,
  },
  joinDescription: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 26,
    marginBottom: theme.spacing.lg,
  },
  joinCtaButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.xl,
  },
  joinCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  joinCtaText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 18,
    marginLeft: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  joinNote: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoIconContainer: {
    width: 40,
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: 17,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

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
import { ORGANIZATION_INFO } from '../constants/data';

export default function CoreActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params || {};

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen informasjon tilgjengelig</Text>
      </View>
    );
  }

  const handleContactPress = () => {
    Linking.openURL(`mailto:${ORGANIZATION_INFO.website}`);
  };

  const handleWebsitePress = () => {
    Linking.openURL(ORGANIZATION_INFO.website);
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
              <Icon name={activity.icon} size={60} color={theme.colors.white} />
            </View>
            <Text style={styles.heroTitle}>{activity.title}</Text>
            <Text style={styles.heroSubtitle}>Kjernevirksomhet</Text>
          </LinearGradient>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.iconWrapper}
            >
              <Icon
                name="information-circle"
                size={32}
                color={theme.colors.white}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Om aktiviteten</Text>
          </View>
          <Text style={styles.description}>{activity.description}</Text>
        </View>

        {/* CTA Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="call" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Bli med</Text>
          </View>
          <Text style={styles.ctaDescription}>
            Ønsker du å delta på {activity.title.toLowerCase()}? Ta kontakt
            med oss for å høre mer om hvordan du kan være med.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContactPress}
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
              <Text style={styles.ctaText}>Ta kontakt</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCtaButton}
            onPress={handleWebsitePress}
            activeOpacity={0.7}
          >
            <Icon name="globe-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.secondaryCtaText}>
              Besøk vår nettside
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrapper}>
              <Icon name="trophy" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Mer informasjon</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="map" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Aktivitet</Text>
                <Text style={styles.infoValue}>{activity.title}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon
                  name="information-circle-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Beskrivelse</Text>
                <Text style={styles.infoValue}>{activity.description}</Text>
              </View>
            </View>
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
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 32,
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
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 28,
  },
  ctaDescription: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 26,
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  ctaText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
  },
  secondaryCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  secondaryCtaText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 17,
    marginLeft: theme.spacing.sm,
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

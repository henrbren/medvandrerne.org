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
import * as WebBrowser from 'expo-web-browser';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { ORGANIZATION_INFO } from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function CoreActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.normal,
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

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen informasjon tilgjengelig</Text>
      </View>
    );
  }

  const headerStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const handleContactPress = () => {
    Linking.openURL(`mailto:${ORGANIZATION_INFO.website}`);
  };

  const handleWebsitePress = async () => {
    await WebBrowser.openBrowserAsync(ORGANIZATION_INFO.website);
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
        {/* Hero Header - Full Width */}
        <Animated.View style={[styles.heroWrapper, headerStyle]}>
          <View style={styles.heroImageContainer}>
            <Image 
              source={require('../assets/img/hero/hero3.jpg')} 
              style={styles.heroBackgroundImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImageOverlay}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Image 
                  source={require('../assets/img/logo.png')} 
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.heroTitle}>{activity.title}</Text>
              <Text style={styles.heroSubtitle}>Kjernevirksomhet</Text>
            </View>
          </View>
        </Animated.View>

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
          <Text style={styles.description}>
            {activity.detailedDescription || activity.description}
          </Text>
        </View>

        {/* Additional Details for Femundløpet */}
        {activity.tasks && activity.tasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="checkmark-circle" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Våre oppgaver</Text>
            </View>
            <View style={styles.tasksContainer}>
              {activity.tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskBullet} />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Partners Section */}
        {activity.partners && activity.partners.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="people" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Samarbeidspartnere</Text>
            </View>
            <View style={styles.partnersContainer}>
              {activity.partners.map((partner, index) => (
                <View key={index} style={styles.partnerItem}>
                  <Icon name="heart" size={16} color={theme.colors.primary} />
                  <Text style={styles.partnerText}>{partner}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Impact/Details Section */}
        {activity.impact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="trophy" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Vårt bidrag</Text>
            </View>
            <Text style={styles.description}>{activity.impact}</Text>
          </View>
        )}

        {/* Two Column Layout for Web */}
        <View style={styles.columnsContainer}>
          {/* CTA Section */}
          <View style={styles.columnSection}>
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
              onPress={async () => {
                const url = activity.website || ORGANIZATION_INFO.website;
                await WebBrowser.openBrowserAsync(url);
              }}
              activeOpacity={0.7}
            >
              <Icon name="globe-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryCtaText}>
                {activity.website ? 'Les mer på nettsiden' : 'Besøk vår nettside'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info Section */}
          <View style={styles.columnSection}>
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
              {activity.year && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="calendar" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>År</Text>
                    <Text style={styles.infoValue}>{activity.year}</Text>
                  </View>
                </View>
              )}
              {activity.participants && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="people" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Deltakere</Text>
                    <Text style={styles.infoValue}>Ca. {activity.participants} personer</Text>
                  </View>
                </View>
              )}
              {activity.location && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="location" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Lokasjon</Text>
                    <Text style={styles.infoValue}>{activity.location}</Text>
                  </View>
                </View>
              )}
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
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  heroImageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    zIndex: 2,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xs,
    ...theme.shadows.small,
    zIndex: 3,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    ...theme.typography.h2,
    fontSize: isWeb ? 24 : 22,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    zIndex: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: theme.spacing.md,
  },
  heroSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.95,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    zIndex: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  columnsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: theme.spacing.xl,
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  columnSection: {
    flex: isWeb ? 1 : undefined,
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
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  ctaDescription: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
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
  tasksContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  taskBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: theme.spacing.md,
  },
  taskText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 24,
  },
  partnersContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: theme.spacing.md,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  partnerText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
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

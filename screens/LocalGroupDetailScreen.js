import React, { useRef, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useFavorites } from '../hooks/useFavorites';

const isWeb = Platform.OS === 'web';

export default function LocalGroupDetailScreen({ route, navigation }) {
  const { group } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { isGroupFavorite, addFavoriteGroup, removeFavoriteGroup, loadFavorites } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

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

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen informasjon tilgjengelig</Text>
      </View>
    );
  }

  const isFavorite = isGroupFavorite(group.id);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await removeFavoriteGroup(group.id);
    } else {
      await addFavoriteGroup(group.id);
    }
  };

  const headerStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

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

  const handleFacebookPress = async (url) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
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
              <Text style={styles.heroTitle}>{group.name}</Text>
              <Text style={styles.heroSubtitle}>Lokallag</Text>
            </View>
          </View>
        </Animated.View>

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

        {/* Favorite Button - Compact */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.compactFavoriteButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <View style={[
              styles.compactFavoriteContent,
              { backgroundColor: isFavorite ? theme.colors.success + '20' : theme.colors.warning + '20' }
            ]}>
              <Icon 
                name={isFavorite ? "star" : "star-outline"} 
                size={18} 
                color={isFavorite ? theme.colors.success : theme.colors.warning} 
              />
              <Text style={[
                styles.compactFavoriteText,
                { color: isFavorite ? theme.colors.success : theme.colors.warning }
              ]}>
                {isFavorite ? 'Lagret i favoritter' : 'Lagre i favoritter'}
              </Text>
              {isFavorite && (
                <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              )}
            </View>
          </TouchableOpacity>
        </View>

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
              style={styles.contactButton}
              onPress={() => handlePhonePress(group.phone)}
              activeOpacity={0.7}
            >
              <View style={styles.contactButtonContent}>
                <Icon name="call-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.contactButtonText}>Ring koordinator</Text>
              </View>
            </TouchableOpacity>
          )}

          {group.email && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleEmailPress(group.email)}
              activeOpacity={0.7}
            >
              <View style={styles.contactButtonContent}>
                <Icon name="mail-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.contactButtonText}>Send e-post</Text>
              </View>
            </TouchableOpacity>
          )}

          {group.facebook && (
            <TouchableOpacity
              style={styles.facebookCtaButton}
              onPress={() => handleFacebookPress(group.facebook)}
              activeOpacity={0.8}
            >
              <View style={styles.facebookCtaContent}>
                <Icon name="logo-facebook" size={20} color="#1877F2" />
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
  // Compact Favorite Button
  compactFavoriteButton: {
    marginBottom: theme.spacing.md,
  },
  compactFavoriteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  compactFavoriteText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
  },
  // Contact Buttons - Smaller, less prominent
  contactButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  contactButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  contactButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
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

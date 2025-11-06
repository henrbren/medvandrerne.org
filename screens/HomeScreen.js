import React, { useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { ORGANIZATION_INFO, MISSION, CORE_ACTIVITIES, SAMPLE_ACTIVITIES } from '../constants/data';
import { useRegistrations } from '../hooks/useRegistrations';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { registrations, loading, loadRegistrations } = useRegistrations();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const headerHeight = Platform.OS === 'ios' ? 44 + insets.top : 64;

  // Refresh registrations when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
    }, [])
  );

  // Get registered activities
  const registeredActivities = SAMPLE_ACTIVITIES.filter(activity => 
    registrations.includes(activity.id)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...theme.animations.springBouncy,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = (url) => {
    Linking.openURL(url);
  };

  const AnimatedSection = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: theme.animations.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          delay,
          ...theme.animations.spring,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          style,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        {children}
      </Animated.View>
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
        {/* Hero Section - With Image Background */}
        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
              marginTop: -headerHeight,
            },
          ]}
        >
          <View style={[styles.heroImageContainer, { paddingTop: headerHeight + theme.spacing.md }]}>
            <Image 
              source={require('../assets/img/hero/hero1.jpg')} 
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
              <Text style={styles.heroSubtitle}>STIFTELSEN</Text>
              <Text style={styles.heroTitle}>Medvandrerne</Text>
              <Text style={styles.heroTagline}>Vi vandrer sammen</Text>
            </View>
          </View>
        </Animated.View>

        {/* My Registrations */}
        {registeredActivities.length > 0 && (
          <AnimatedSection delay={100}>
            <View style={styles.registrationsSection}>
              <View style={styles.sectionHeaderMinimal}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.headerIconGradient}
                >
                  <Icon name="checkmark-circle" size={28} color={theme.colors.white} />
                </LinearGradient>
                <Text style={styles.sectionTitleLarge}>Mine påmeldinger</Text>
              </View>
              
              <View style={styles.registrationsList}>
                {registeredActivities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.registrationCard}
                    onPress={() => navigation.navigate('ActivityDetail', { activity })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.registrationIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.primary + '40', theme.colors.primary + '20']}
                        style={styles.registrationIconGradient}
                      >
                        <Icon name={getActivityIcon(activity.type)} size={24} color={theme.colors.primary} />
                      </LinearGradient>
                    </View>
                    <View style={styles.registrationContent}>
                      <Text style={styles.registrationTitle}>{activity.title}</Text>
                      <View style={styles.registrationMeta}>
                        <Icon name="time" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.registrationDate}>
                          {formatDate(activity.date)}
                          {activity.time && ` • ${activity.time}`}
                        </Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedSection>
        )}

        {/* Mission Statement - No card, more space */}
        <AnimatedSection delay={registeredActivities.length > 0 ? 200 : 100}>
          <View style={styles.missionSection}>
            <View style={styles.sectionHeaderMinimal}>
              <Text style={styles.sectionTitleLarge}>Om Medvandrerne</Text>
            </View>
            <Text style={styles.missionText}>{MISSION.description}</Text>
            <Text style={styles.missionText}>{MISSION.nature}</Text>
            <Text style={styles.missionText}>{MISSION.equality}</Text>
            <Text style={styles.missionText}>{MISSION.responsibility}</Text>
          </View>
        </AnimatedSection>

        {/* Core Activities - Interactive List */}
        <AnimatedSection delay={registeredActivities.length > 0 ? 300 : 200}>
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeaderMinimal}>
              <Icon name="trophy" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitleLarge}>Kjernevirksomhet</Text>
            </View>
            
            <View style={styles.activitiesList}>
              {CORE_ACTIVITIES.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  activeOpacity={0.6}
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('CoreActivityDetail', { activity })}
                >
                  <View style={styles.activityIconWrapper}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primaryLight]}
                      style={styles.activityIconGradient}
                    >
                      <Icon name={activity.icon} size={32} color={theme.colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  </View>
                  <View style={styles.activityChevron}>
                    <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedSection>

        {/* Support CTA - Large and Prominent */}
        <AnimatedSection delay={300}>
          <View style={styles.supportSection}>
            <View style={styles.sectionHeaderMinimal}>
              <Icon name="heart" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitleLarge}>Støtt oss</Text>
            </View>
            
            {/* Large Primary CTA */}
            <TouchableOpacity
              style={styles.primaryCTA}
              onPress={() => handlePress(ORGANIZATION_INFO.spleis)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryCTAGradient}
              >
                <View style={styles.ctaIconContainer}>
                  <Icon name="heart" size={32} color={theme.colors.white} />
                </View>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaTitle}>Støtt på Spleis.no</Text>
                  <Text style={styles.ctaSubtitle}>Hjelp oss å fortsette arbeidet</Text>
                </View>
                <Icon name="arrow-forward" size={28} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Payment Info - Glassmorphism Cards */}
            <View style={styles.paymentGrid}>
              <View style={styles.paymentCard}>
                <View style={[styles.paymentIconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="phone-portrait" size={28} color={theme.colors.warning} />
                </View>
                <Text style={styles.paymentLabel}>VIPPS</Text>
                <Text style={styles.paymentValue}>{ORGANIZATION_INFO.vipps}</Text>
              </View>
              
              <View style={styles.paymentCard}>
                <View style={[styles.paymentIconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="card" size={28} color={theme.colors.info} />
                </View>
                <Text style={styles.paymentLabel}>Bankkonto</Text>
                <Text style={styles.paymentValue}>{ORGANIZATION_INFO.bankAccount}</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Contact Information - Clean List */}
        <AnimatedSection delay={400}>
          <View style={styles.contactSection}>
            <View style={styles.sectionHeaderMinimal}>
              <Icon name="information-circle" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitleLarge}>Kontaktinformasjon</Text>
            </View>
            
            <View style={styles.contactList}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handlePress(ORGANIZATION_INFO.website)}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconWrapper, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="globe" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Nettside</Text>
                  <Text style={styles.contactValue}>{ORGANIZATION_INFO.website}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
              
              <View style={styles.contactItem}>
                <View style={[styles.contactIconWrapper, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="location" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Adresse</Text>
                  <Text style={styles.contactValue}>{ORGANIZATION_INFO.address}</Text>
                </View>
              </View>
              
              <View style={styles.contactItem}>
                <View style={[styles.contactIconWrapper, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="business" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Org.nr</Text>
                  <Text style={styles.contactValue}>{ORGANIZATION_INFO.orgNumber}</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedSection>

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
    marginBottom: theme.spacing.xl,
  },
  heroImageContainer: {
    width: '100%',
    minHeight: isWeb ? 400 : 360,
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
  heroSection: {
    paddingVertical: theme.spacing.xxxl * 1.5,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  heroContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    zIndex: 2,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xs,
    ...theme.shadows.large,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.9,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: theme.spacing.xs / 2,
    fontSize: 11,
  },
  heroTitle: {
    ...theme.typography.h1,
    fontSize: isWeb ? 28 : 24,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  heroTagline: {
    ...theme.typography.body,
    fontSize: isWeb ? 16 : 15,
    color: theme.colors.white,
    opacity: 0.95,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  
  // Section Headers - Minimal
  sectionHeaderMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleLarge: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  
  // Registrations Section
  registrationsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  registrationsList: {
    gap: theme.spacing.md,
  },
  registrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  registrationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  registrationIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrationContent: {
    flex: 1,
  },
  registrationTitle: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  registrationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  registrationDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  
  // Mission Section - No cards
  missionSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  missionText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  
  // Activities Section
  activitiesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  activitiesList: {
    gap: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  activityIconWrapper: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.title,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  activityDescription: {
    ...theme.typography.bodySmall,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  activityChevron: {
    opacity: 0.5,
  },
  
  // Support Section
  supportSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  primaryCTA: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow,
  },
  primaryCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  ctaSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
  },
  
  // Payment Grid
  paymentGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: theme.spacing.lg,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  paymentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  paymentLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  paymentValue: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
  },
  
  // Contact Section
  contactSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  contactList: {
    gap: theme.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  contactIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
    fontWeight: '600',
  },
  contactValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

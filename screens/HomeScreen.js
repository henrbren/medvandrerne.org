import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { ORGANIZATION_INFO, MISSION, CORE_ACTIVITIES } from '../constants/data';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
        {/* Hero Section - Modernized */}
        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Icon name="walk" size={48} color={theme.colors.white} />
              </View>
              <Text style={styles.heroSubtitle}>STIFTELSEN</Text>
              <Text style={styles.heroTitle}>Medvandrerne</Text>
              <Text style={styles.heroTagline}>Vi vandrer sammen</Text>
            </View>
            
            {/* Decorative blur circles */}
            <View style={styles.heroDecoration1} />
            <View style={styles.heroDecoration2} />
            <View style={styles.heroDecoration3} />
          </LinearGradient>
        </Animated.View>

        {/* Mission Statement - No card, more space */}
        <AnimatedSection delay={100}>
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
        <AnimatedSection delay={200}>
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
    marginBottom: theme.spacing.xxxl,
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
    alignItems: 'center',
    zIndex: 2,
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
  },
  heroSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.9,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  heroTitle: {
    ...theme.typography.display,
    fontSize: isWeb ? 64 : 52,
    fontWeight: '900',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  heroTagline: {
    ...theme.typography.title,
    color: theme.colors.white,
    opacity: 0.95,
    fontStyle: 'italic',
    fontWeight: '500',
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
  heroDecoration3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white + '08',
    bottom: 50,
    right: 30,
    zIndex: 1,
  },
  
  // Section Headers - Minimal
  sectionHeaderMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sectionTitleLarge: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  
  // Mission Section - No cards
  missionSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  missionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
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
    padding: theme.spacing.lg,
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
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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

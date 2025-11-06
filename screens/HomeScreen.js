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

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = (url) => {
    Linking.openURL(url);
  };

  const AnimatedCard = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 600,
          delay,
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
        {/* Hero Section with Premium Gradient */}
        <Animated.View
          style={[
            styles.heroWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd, theme.colors.gradientLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroTitleContainer}>
                <Text style={styles.heroTitleMain}>Stiftelsen</Text>
                <Text style={styles.heroTitle}>Medvandrerne</Text>
              </View>
              <Text style={styles.heroSubtitle}>Vi vandrer sammen</Text>
              <View style={styles.heroDivider} />
            </View>
            {/* Decorative elements */}
            <View style={styles.heroDecoration1} />
            <View style={styles.heroDecoration2} />
          </LinearGradient>
        </Animated.View>

        {/* About Section */}
        <AnimatedCard delay={100}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="information-circle" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Om Medvandrerne</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{MISSION.description}</Text>
              <Text style={styles.text}>{MISSION.nature}</Text>
              <Text style={styles.text}>{MISSION.equality}</Text>
              <Text style={styles.text}>{MISSION.responsibility}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Core Activities */}
        <AnimatedCard delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="trophy" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Kjernevirksomhet</Text>
            </View>
            {CORE_ACTIVITIES.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                activeOpacity={0.7}
                style={[
                  styles.activityCard,
                  index === CORE_ACTIVITIES.length - 1 && styles.lastCard,
                ]}
              >
                <View style={styles.activityIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
                    style={styles.activityIconGradient}
                  >
                    <Icon name={activity.icon} size={28} color={theme.colors.primary} />
                  </LinearGradient>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <View style={styles.activityArrow}>
                  <Icon name="chevron-forward-outline" size={20} color={theme.colors.textLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>

        {/* Support Section */}
        <AnimatedCard delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="heart" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Støtt oss</Text>
            </View>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handlePress(ORGANIZATION_INFO.spleis)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.primaryLight, theme.colors.gradientLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.supportButtonGradient}
              >
                <View style={styles.supportIconContainer}>
                  <Icon name="heart-outline" size={24} color={theme.colors.white} />
                </View>
                <Text style={styles.supportButtonText}>Støtt på Spleis.no</Text>
                <View style={styles.supportArrow}>
                  <Icon name="chevron-forward-outline" size={20} color={theme.colors.white} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.paymentInfoContainer}>
              <View style={styles.paymentRow}>
                <View style={styles.paymentIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary + '15', theme.colors.primaryLight + '15']}
                    style={styles.paymentIconGradient}
                  >
                    <Icon name="phone-portrait" size={20} color={theme.colors.primary} />
                  </LinearGradient>
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentLabel}>VIPPS</Text>
                  <Text style={styles.paymentValue}>{ORGANIZATION_INFO.vipps}</Text>
                </View>
              </View>
              
              <View style={styles.paymentRow}>
                <View style={styles.paymentIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary + '15', theme.colors.primaryLight + '15']}
                    style={styles.paymentIconGradient}
                  >
                    <Icon name="card" size={20} color={theme.colors.primary} />
                  </LinearGradient>
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentLabel}>Bankkonto</Text>
                  <Text style={styles.paymentValue}>{ORGANIZATION_INFO.bankAccount}</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Contact Information */}
        <AnimatedCard delay={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="call" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Kontaktinformasjon</Text>
            </View>
            <View style={styles.contactInfoContainer}>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePress(ORGANIZATION_INFO.website)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name="globe-outline" size={22} color={theme.colors.primary} />
                </View>
                <Text style={styles.contactLink}>{ORGANIZATION_INFO.website}</Text>
                <Icon name="chevron-forward-outline" size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIconContainer}>
                  <Icon name="location-outline" size={22} color={theme.colors.primary} />
                </View>
                <Text style={styles.contactText}>{ORGANIZATION_INFO.address}</Text>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIconContainer}>
                  <Icon name="business-outline" size={22} color={theme.colors.primary} />
                </View>
                <Text style={styles.contactText}>Org.nr: {ORGANIZATION_INFO.orgNumber}</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  heroWrapper: {
    marginBottom: theme.spacing.lg,
  },
  heroSection: {
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    marginHorizontal: isWeb ? 0 : theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.xl,
    ...theme.shadows.glow,
    ...(isWeb && {
      paddingVertical: theme.spacing.xxl * 1.5,
      paddingHorizontal: theme.spacing.xxl,
    }),
  },
  heroDecoration1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.white + '15',
    top: -80,
    right: -80,
  },
  heroDecoration2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.white + '12',
    bottom: -50,
    left: -50,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroTitleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroTitleMain: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.white,
    opacity: 0.95,
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...theme.typography.display,
    fontSize: isWeb ? 56 : 42,
    fontWeight: '900',
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.98,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  heroDivider: {
    width: 80,
    height: 5,
    backgroundColor: theme.colors.white,
    opacity: 0.95,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: isWeb ? 0 : theme.spacing.md,
    marginBottom: isWeb ? theme.web.cardGap : theme.spacing.lg,
    padding: isWeb ? theme.spacing.xxl : theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    ...theme.shadows.large,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...(isWeb && {
      width: '100%',
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  textContainer: {
    marginTop: theme.spacing.sm,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
    fontSize: 17,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    padding: isWeb ? theme.spacing.xl : theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    alignItems: 'center',
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isWeb && {
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  lastCard: {
    marginBottom: 0,
  },
  activityIconContainer: {
    marginRight: theme.spacing.md,
  },
  activityIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  activityDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  activityArrow: {
    marginLeft: theme.spacing.sm,
  },
  supportButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.xl,
    ...theme.shadows.glow,
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  supportIconContainer: {
    marginRight: theme.spacing.sm,
  },
  supportButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  supportArrow: {
    marginLeft: theme.spacing.sm,
  },
  paymentInfoContainer: {
    marginTop: theme.spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  paymentIconContainer: {
    marginRight: theme.spacing.md,
  },
  paymentIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  paymentContent: {
    flex: 1,
  },
  paymentLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  paymentValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  contactInfoContainer: {
    marginTop: theme.spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.small,
  },
  contactIconContainer: {
    width: 44,
    alignItems: 'center',
  },
  contactLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    flex: 1,
    fontSize: 17,
  },
  contactText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    fontSize: 17,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

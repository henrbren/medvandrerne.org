import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { ORGANIZATION_INFO, SUPPORTERS } from '../constants/data';

const { width } = Dimensions.get('window');

export default function DonationsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: theme.animations.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const AnimatedCard = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: theme.animations.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: theme.animations.normal,
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

  const handleDonationPress = (type, value) => {
    let url = '';
    let message = '';

    switch (type) {
      case 'vipps':
        url = `vipps://send?number=${value}`;
        message = `Åpner Vipps for å sende til ${value}`;
        break;
      case 'bank':
        // Copy to clipboard functionality would be implemented here
        Alert.alert(
          'Bankoverføring',
          `Kontonummer: ${value}\n\nKopier dette nummeret for å gjøre en bankoverføring.`,
          [{ text: 'OK' }]
        );
        return;
      case 'spleis':
        url = value;
        message = 'Åpner Spleis.no i nettleser';
        break;
      default:
        return;
    }

    Alert.alert(
      'Åpner app',
      message,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Åpne',
          onPress: () => Linking.openURL(url).catch(() => {
            Alert.alert('Feil', 'Kunne ikke åpne appen. Sjekk at den er installert.');
          })
        }
      ]
    );
  };

  const DonationCard = ({ title, description, icon, type, value, gradient, delay }) => (
    <AnimatedCard delay={delay}>
      <TouchableOpacity
        style={styles.donationCard}
        onPress={() => handleDonationPress(type, value)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.donationGradient}
        >
          <View style={styles.donationIconContainer}>
            <Icon name={icon} size={32} color={theme.colors.white} />
          </View>
          <View style={styles.donationContent}>
            <Text style={styles.donationTitle}>{title}</Text>
            <Text style={styles.donationDescription}>{description}</Text>
          </View>
          <View style={styles.donationArrow}>
            <Icon name="chevron-forward-outline" size={24} color={theme.colors.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerSection}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Icon name="heart" size={32} color={theme.colors.white} />
              </View>
              <Text style={styles.headerTitle}>Støtt oss</Text>
              <Text style={styles.headerSubtitle}>Din støtte gjør en forskjell</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Introduction */}
        <AnimatedCard delay={100}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Hvorfor støtte Medvandrerne?</Text>
            <Text style={styles.introText}>
              Din støtte hjelper oss å arrangere motivasjonsturer, drive lokallagsvirksomhet og
              støtte mennesker i recovery. Hver krone bidrar til håp, mestring og fellesskap.
            </Text>
          </View>
        </AnimatedCard>

        {/* Quick Donation Options */}
        <AnimatedCard delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="cash" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Hurtig støtte</Text>
            </View>

            <DonationCard
              title="Vipps"
              description={`Send penger enkelt med Vipps til ${ORGANIZATION_INFO.vipps}`}
              icon="phone-portrait"
              type="vipps"
              value={ORGANIZATION_INFO.vipps}
              gradient={[theme.colors.primary, theme.colors.primaryLight]}
              delay={300}
            />

            <DonationCard
              title="Spleis"
              description="Bli med på felles innsamling eller start din egen"
              icon="people"
              type="spleis"
              value={ORGANIZATION_INFO.spleis}
              gradient={[theme.colors.secondary, theme.colors.accent]}
              delay={400}
            />

            <DonationCard
              title="Bankoverføring"
              description={`Overfør til konto ${ORGANIZATION_INFO.bankAccount}`}
              icon="card"
              type="bank"
              value={ORGANIZATION_INFO.bankAccount}
              gradient={[theme.colors.primaryDark, theme.colors.primary]}
              delay={500}
            />
          </View>
        </AnimatedCard>

        {/* Supporters */}
        <AnimatedCard delay={600}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}>
                <Icon name="ribbon" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Våre støttespillere</Text>
            </View>

            <View style={styles.supportersGrid}>
              <View style={styles.supporterCategory}>
                <Text style={styles.categoryTitle}>Finansiell støtte</Text>
                {SUPPORTERS.financial.map((supporter, index) => (
                  <View key={index} style={styles.supporterItem}>
                    <Text style={styles.supporterText}>{supporter}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.supporterCategory}>
                <Text style={styles.categoryTitle}>Partnere</Text>
                {SUPPORTERS.partners.map((supporter, index) => (
                  <View key={index} style={styles.supporterItem}>
                    <Text style={styles.supporterText}>{supporter}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Impact Section */}
        <AnimatedCard delay={700}>
          <View style={styles.impactSection}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.secondary + '10']}
              style={styles.impactGradient}
            >
              <View style={styles.impactIconContainer}>
                <Icon name="stats-chart" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.impactTitle}>Din støtte i aksjon</Text>
              <Text style={styles.impactText}>
                I 2024 hjalp vi over 200 mennesker gjennom våre programmer.
                Din støtte gjør det mulig å fortsette dette viktige arbeidet.
              </Text>
            </LinearGradient>
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
  headerWrapper: {
    marginBottom: theme.spacing.lg,
  },
  headerSection: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.95,
    fontStyle: 'italic',
    fontSize: 18,
    fontWeight: '500',
  },
  introSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  introTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    fontSize: 20,
    fontWeight: '700',
  },
  introText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
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
    marginBottom: theme.spacing.lg,
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
    marginLeft: theme.spacing.xs,
    fontSize: 22,
    fontWeight: '700',
  },
  donationCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
  },
  donationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  donationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  donationContent: {
    flex: 1,
  },
  donationTitle: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  donationDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
    lineHeight: 18,
  },
  donationArrow: {
    marginLeft: theme.spacing.sm,
  },
  supportersGrid: {
    marginTop: theme.spacing.sm,
  },
  supporterCategory: {
    marginBottom: theme.spacing.lg,
  },
  categoryTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  supporterItem: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  supporterText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  impactSection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  impactGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  impactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  impactTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  impactText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

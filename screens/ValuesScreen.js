import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function ValuesScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const values = [
    {
      id: 'bonfire',
      title: 'Bålet',
      subtitle: 'Fellesskap og samhørighet',
      icon: 'flame',
      color: theme.colors.warning,
      route: 'Bonfire',
    },
    {
      id: 'backpack',
      title: 'Ryggsekken',
      subtitle: 'Bagage og erfaring',
      icon: 'backpack',
      color: theme.colors.success,
      route: 'Backpack',
    },
    {
      id: 'walkingstick',
      title: 'Vandrerstaven',
      subtitle: 'Støtte og veiledning',
      icon: 'fitness',
      color: theme.colors.info,
      route: 'WalkingStick',
    },
  ];

  const AnimatedSection = ({ children, delay = 0 }) => {
    const sectionFade = useRef(new Animated.Value(0)).current;
    const sectionSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(sectionFade, {
          toValue: 1,
          duration: theme.animations.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(sectionSlide, {
          toValue: 0,
          delay,
          ...theme.animations.spring,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: sectionFade,
          transform: [{ translateY: sectionSlide }],
        }}
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
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Header */}
        <AnimatedSection>
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="heart" size={48} color={theme.colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Verdier og symboler</Text>
            <Text style={styles.headerDescription}>
              Medvandrerne bygger på sterke verdier og symboler som veileder vårt arbeid. 
              Utforsk hva bålet, ryggsekken og vandrerstaven betyr for oss.
            </Text>
          </View>
        </AnimatedSection>

        {/* Values Cards */}
        <View style={styles.valuesContainer}>
          {values.map((value, index) => (
            <AnimatedSection key={value.id} delay={100 * (index + 1)}>
              <TouchableOpacity
                style={styles.valueCard}
                onPress={() => navigation.navigate(value.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.surface, theme.colors.backgroundElevated]}
                  style={styles.valueCardGradient}
                >
                  <View style={styles.valueIconContainer}>
                    <LinearGradient
                      colors={[value.color, value.color + 'CC']}
                      style={styles.valueIconGradient}
                    >
                      <Icon name={value.icon} size={40} color={theme.colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.valueContent}>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueSubtitle}>{value.subtitle}</Text>
                  </View>
                  <View style={styles.valueArrow}>
                    <Icon name="chevron-forward" size={28} color={theme.colors.textTertiary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedSection>
          ))}
        </View>

        {/* Core Values Section */}
        <AnimatedSection delay={400}>
          <View style={styles.coreValuesSection}>
            <View style={styles.sectionHeader}>
              <Icon name="star" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Våre kjerneverdier</Text>
            </View>
            
            <View style={styles.coreValuesList}>
              <View style={styles.coreValueItem}>
                <View style={[styles.coreValueIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="heart" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.coreValueContent}>
                  <Text style={styles.coreValueTitle}>Salutogenese og Recovery</Text>
                  <Text style={styles.coreValueText}>
                    Vi fokuserer på det som gjør den enkelte frisk og flytter fokus vekk fra selve «sykdomsbildet».
                  </Text>
                </View>
              </View>

              <View style={styles.coreValueItem}>
                <View style={[styles.coreValueIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="leaf" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.coreValueContent}>
                  <Text style={styles.coreValueTitle}>Naturen som metode</Text>
                  <Text style={styles.coreValueText}>
                    Naturen spiller en sentral rolle i vårt konsept. Vi arrangerer turer som utfordrer og gir muligheter for vekst.
                  </Text>
                </View>
              </View>

              <View style={styles.coreValueItem}>
                <View style={[styles.coreValueIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="people" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.coreValueContent}>
                  <Text style={styles.coreValueTitle}>Likestilling og fellesskap</Text>
                  <Text style={styles.coreValueText}>
                    På turene er alle likestilte. Vi deler erfaringer rundt bålet og skaper en følelse av tilhørighet.
                  </Text>
                </View>
              </View>

              <View style={styles.coreValueItem}>
                <View style={[styles.coreValueIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="trophy" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.coreValueContent}>
                  <Text style={styles.coreValueTitle}>Mestring og ansvar</Text>
                  <Text style={styles.coreValueText}>
                    Gjennom å mestre utfordringer i naturen får deltakerne økt selvtillit og mestringsfølelse.
                  </Text>
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
  topSpacer: {
    height: theme.spacing.xl,
  },
  
  // Header Section
  headerSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glowSubtle,
  },
  headerIconGradient: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  headerDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 600,
  },
  
  // Values Container
  valuesContainer: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
  },
  valueCard: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  valueCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  valueIconContainer: {
    ...theme.shadows.medium,
  },
  valueIconGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  valueSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  valueArrow: {
    opacity: 0.6,
  },
  
  // Core Values Section
  coreValuesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  coreValuesList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  coreValueItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  coreValueIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreValueContent: {
    flex: 1,
  },
  coreValueTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  coreValueText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});


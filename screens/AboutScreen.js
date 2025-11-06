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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import {
  ORGANIZATION_INFO,
  MISSION,
  CORE_ACTIVITIES,
  SUPPORTERS,
} from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function AboutScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = async (url) => {
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        Linking.openURL(url);
      }
    }
  };

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

        {/* About Section */}
        <AnimatedSection>
          <View style={styles.aboutSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="information-circle" size={32} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Om Medvandrerne</Text>
            </View>
            <Text style={styles.missionText}>{MISSION.description}</Text>
            <Text style={styles.missionText}>{MISSION.nature}</Text>
            <Text style={styles.missionText}>{MISSION.equality}</Text>
            <Text style={styles.missionText}>{MISSION.responsibility}</Text>
          </View>
        </AnimatedSection>

        {/* Values and Symbols */}
        <AnimatedSection delay={100}>
          <View style={styles.valuesSection}>
            <View style={styles.sectionHeader}>
              <Icon name="heart" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Verdier og symboler</Text>
            </View>
            
            <View style={styles.valuesList}>
              <View style={styles.valueCard}>
                <View style={[styles.valueIcon, { backgroundColor: theme.colors.primary + '25' }]}>
                  <Icon name="heart" size={28} color={theme.colors.primary} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Salutogenese og Recovery</Text>
                  <Text style={styles.valueText}>
                    Vi fokuserer på det som gjør den enkelte frisk og flytter fokus
                    vekk fra selve «sykdomsbildet».
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <View style={[styles.valueIcon, { backgroundColor: theme.colors.success + '25' }]}>
                  <Icon name="map" size={28} color={theme.colors.success} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Naturen som metode</Text>
                  <Text style={styles.valueText}>
                    Naturen spiller en sentral rolle i vårt konsept. Vi arrangerer
                    turer som utfordrer og gir muligheter for vekst.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <View style={[styles.valueIcon, { backgroundColor: theme.colors.info + '25' }]}>
                  <Icon name="people" size={28} color={theme.colors.info} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Likestilling og fellesskap</Text>
                  <Text style={styles.valueText}>
                    På turene er alle likestilte. Vi deler erfaringer rundt bålet og
                    skaper en følelse av tilhørighet.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <View style={[styles.valueIcon, { backgroundColor: theme.colors.warning + '25' }]}>
                  <Icon name="trophy" size={28} color={theme.colors.warning} />
                </View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Mestring og ansvar</Text>
                  <Text style={styles.valueText}>
                    Gjennom å mestre utfordringer i naturen får deltakerne økt
                    selvtillit og mestringsfølelse.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Symbols Section */}
        <AnimatedSection delay={200}>
          <View style={styles.symbolsSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="flame" size={32} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Våre symboler</Text>
            </View>
            
            <View style={styles.symbolsList}>
              {/* Bålet */}
              <View style={styles.symbolCard}>
                <LinearGradient
                  colors={[theme.colors.warning + '20', theme.colors.warning + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.symbolGradient}
                >
                  <View style={styles.symbolHeader}>
                    <View style={styles.symbolIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.warning, theme.colors.warning + 'DD']}
                        style={styles.symbolIconGradient}
                      >
                        <Icon name="flame" size={36} color={theme.colors.white} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.symbolTitle}>Bålet</Text>
                  </View>
                  <Text style={styles.symbolText}>
                    Bålet representerer fellesskap og samhørighet. Rundt bålet kveld etter kveld 
                    deler deltakerne erfaringer, sorger og håp. Dette skaper en følelse av 
                    tilhørighet og fellesskap som kan være vanskelig å finne andre steder. 
                    Bålet er et sted hvor alle er likestilte, uten "ovenfra og ned"-relasjoner.
                  </Text>
                </LinearGradient>
              </View>

              {/* Ryggsekken */}
              <View style={styles.symbolCard}>
                <LinearGradient
                  colors={[theme.colors.success + '20', theme.colors.success + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.symbolGradient}
                >
                  <View style={styles.symbolHeader}>
                    <View style={styles.symbolIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.success, theme.colors.success + 'DD']}
                        style={styles.symbolIconGradient}
                      >
                        <Icon name="backpack" size={36} color={theme.colors.white} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.symbolTitle}>Ryggsekken</Text>
                  </View>
                  <Text style={styles.symbolText}>
                    Ryggsekken symboliserer bagasjen vi bærer med oss - både fysisk og 
                    mentalt. Den representerer erfaringene, utfordringene og læringen vi 
                    tar med oss gjennom livet. På turene lærer vi å bære vår egen ryggsekk, 
                    men også å støtte hverandre når sekken blir tung.
                  </Text>
                </LinearGradient>
              </View>

              {/* Vandrerstaven */}
              <View style={styles.symbolCard}>
                <LinearGradient
                  colors={[theme.colors.info + '20', theme.colors.info + '10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.symbolGradient}
                >
                  <View style={styles.symbolHeader}>
                    <View style={styles.symbolIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.info, theme.colors.info + 'DD']}
                        style={styles.symbolIconGradient}
                      >
                        <Icon name="fitness" size={36} color={theme.colors.white} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.symbolTitle}>Vandrerstaven</Text>
                  </View>
                  <Text style={styles.symbolText}>
                    Vandrerstaven representerer støtte og veiledning på veien. Den er et 
                    verktøy som hjelper oss å finne balanse og stabilitet når terrenget 
                    blir utfordrende. Staven minner oss om at vi ikke er alene på reisen, 
                    og at det er greit å søke støtte når vi trenger det.
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Core Activities */}
        <AnimatedSection delay={300}>
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Icon name="trophy" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Kjernevirksomhet</Text>
            </View>
            
            <View style={styles.activitiesList}>
              {CORE_ACTIVITIES.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('CoreActivityDetail', { activity })}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary + '40', theme.colors.primary + '20']}
                      style={styles.activityIconGradient}
                    >
                      <Icon name={activity.icon} size={26} color={theme.colors.primary} />
                    </LinearGradient>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedSection>

        {/* Organization Information */}
        <AnimatedSection delay={400}>
          <View style={styles.organizationSection}>
            <View style={styles.sectionHeader}>
              <Icon name="business" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Organisasjonsinformasjon</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Navn</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Organisasjonsnummer</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.orgNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kommune</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.municipality}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stiftelsesdato</Text>
                <Text style={styles.infoValue}>03.01.2022</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Formål</Text>
                <Text style={styles.infoValue}>
                  Legge til rette for unike opplevelser og turer i naturen gjennom
                  motivasjonsturer, frivillig arbeid, erfaringsformidling, læring og
                  andre sosiale aktiviteter.
                </Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Supporters */}
        <AnimatedSection delay={500}>
          <View style={styles.supportersSection}>
            <View style={styles.sectionHeader}>
              <Icon name="heart" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Takk til våre støttespillere</Text>
            </View>
            
            <View style={styles.supportersContainer}>
              <Text style={styles.subsectionTitle}>Økonomiske støttespillere</Text>
              <View style={styles.supportersList}>
                {SUPPORTERS.financial.map((supporter, index) => (
                  <View key={index} style={styles.supporterItem}>
                    <View style={styles.supporterBullet} />
                    <Text style={styles.supporterText}>{supporter}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Samarbeidspartnere</Text>
              <View style={styles.supportersList}>
                {SUPPORTERS.partners.map((partner, index) => (
                  <View key={index} style={styles.supporterItem}>
                    <View style={styles.supporterBullet} />
                    <Text style={styles.supporterText}>{partner}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Gode venner</Text>
              <View style={styles.supportersList}>
                {SUPPORTERS.friends.map((friend, index) => (
                  <View key={index} style={styles.supporterItem}>
                    <View style={styles.supporterBullet} />
                    <Text style={styles.supporterText}>{friend}</Text>
                  </View>
                ))}
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
  
  // Section Headers
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
  
  // About Section
  aboutSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  missionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
  },
  
  // Values Section
  valuesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  valuesList: {
    gap: theme.spacing.lg,
  },
  valueCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  valueIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  valueText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  activityIconContainer: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconGradient: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  activityDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  
  // Organization Section
  organizationSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  infoRow: {
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 26,
  },
  
  // Supporters Section
  supportersSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  supportersContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  subsectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  supportersList: {
    gap: theme.spacing.sm,
  },
  supporterItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  supporterBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  supporterText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 24,
  },
  
  // Symbols Section
  symbolsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  symbolsList: {
    gap: theme.spacing.lg,
  },
  symbolCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  symbolGradient: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
  },
  symbolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  symbolIconContainer: {
    ...theme.shadows.glowSubtle,
  },
  symbolIconGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  symbolText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 26,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

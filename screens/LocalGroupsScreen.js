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
import { LOCAL_GROUPS } from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function LocalGroupsScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const handleGroupPress = (group) => {
    navigation.navigate('LocalGroupDetail', { group });
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
        {/* Hero Header - Full Width */}
        <AnimatedSection>
          <View style={styles.heroWrapper}>
            <View style={styles.heroImageContainer}>
              <Image 
                source={require('../assets/img/lok1.jpg')} 
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
                <Text style={styles.heroTitle}>Lokallagene våre</Text>
                <Text style={styles.heroSubtitle}>
                  Faste turer og sosiale arrangementer
                </Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Description Section */}
        <AnimatedSection delay={100}>
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>
              Her har du en oversikt over våre lokale Facebookgrupper. Hvert enkelt
              lokallag har faste turer, minst en dag i uken. I tillegg postes det
              sosiale arrangementer og invitasjoner til større aktiviteter som
              motivasjonsturer, miljøaksjoner og deltakelse på større sports- og
              kulturarrangementer som Femundløpet, frivilighetskorps på Tons of Rock,
              Rein Sognefjord og liknende.
            </Text>
          </View>
        </AnimatedSection>

        {/* Local Groups */}
        <View style={styles.groupsContainer}>
          {LOCAL_GROUPS.map((group, index) => (
            <AnimatedSection key={group.id} delay={100 * (index + 1)}>
              <TouchableOpacity
                style={styles.groupCard}
                onPress={() => handleGroupPress(group)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.surface, theme.colors.backgroundElevated]}
                  style={styles.groupCardGradient}
                >
                  {/* Group Header */}
                  <View style={styles.groupHeader}>
                    <View style={styles.groupIconContainer}>
                      <LinearGradient
                        colors={[theme.colors.primary + '40', theme.colors.primary + '20']}
                        style={styles.groupIcon}
                      >
                        <Icon name="people" size={32} color={theme.colors.primary} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                  </View>

                  {/* Group Details */}
                  <View style={styles.groupDetails}>
                    {group.coordinator && (
                      <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: theme.colors.info + '20' }]}>
                          <Icon name="person" size={18} color={theme.colors.info} />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Koordinator</Text>
                          <Text style={styles.detailValue}>{group.coordinator}</Text>
                        </View>
                      </View>
                    )}

                    {group.phone && (
                      <TouchableOpacity
                        style={styles.detailRow}
                        onPress={() => handlePhonePress(group.phone)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.detailIcon, { backgroundColor: theme.colors.success + '20' }]}>
                          <Icon name="call" size={18} color={theme.colors.success} />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Telefon</Text>
                          <Text style={[styles.detailValue, styles.detailLink]}>{group.phone}</Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {group.email && (
                      <TouchableOpacity
                        style={styles.detailRow}
                        onPress={() => handleEmailPress(group.email)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.detailIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                          <Icon name="mail" size={18} color={theme.colors.warning} />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>E-post</Text>
                          <Text style={[styles.detailValue, styles.detailLink]}>{group.email}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Facebook Button */}
                  {group.facebook && (
                    <TouchableOpacity
                      style={styles.facebookCTA}
                      onPress={() => handleFacebookPress(group.facebook)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#1877F2', '#0A66C2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.facebookCTAGradient}
                      >
                        <Icon name="logo-facebook" size={24} color={theme.colors.white} />
                        <Text style={styles.facebookCTAText}>Facebook-gruppe</Text>
                        <Icon name="arrow-forward" size={20} color={theme.colors.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedSection>
          ))}
        </View>

        {/* Facebook Links Section */}
        <AnimatedSection delay={300}>
          <View style={styles.facebookSection}>
            <View style={styles.sectionHeaderMinimal}>
              <Icon name="logo-facebook" size={28} color="#1877F2" />
              <Text style={styles.sectionTitleLarge}>Medvandrerne på Facebook</Text>
            </View>
            
            <View style={styles.facebookLinksContainer}>
              <TouchableOpacity
                style={styles.facebookLinkCard}
                onPress={() => handleFacebookPress('https://www.facebook.com/MedNaturenSomMetode/')}
                activeOpacity={0.8}
              >
                <View style={styles.facebookLinkIcon}>
                  <Icon name="logo-facebook" size={32} color="#1877F2" />
                </View>
                <View style={styles.facebookLinkText}>
                  <Text style={styles.facebookLinkTitle}>Stiftelsen Medvandrerne</Text>
                  <Text style={styles.facebookLinkSubtitle}>Hjem</Text>
                </View>
                <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.facebookLinkCard}
                onPress={() => handleFacebookPress('https://www.facebook.com/groups/218262935581083')}
                activeOpacity={0.8}
              >
                <View style={styles.facebookLinkIcon}>
                  <Icon name="logo-facebook" size={32} color="#1877F2" />
                </View>
                <View style={styles.facebookLinkText}>
                  <Text style={styles.facebookLinkTitle}>Venner av Medvandrerne</Text>
                  <Text style={styles.facebookLinkSubtitle}>Fellesskap</Text>
                </View>
                <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>
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
  
  // Description Section
  descriptionSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 600,
    alignSelf: 'center',
  },
  
  // Section Headers
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
  
  // Groups Container
  groupsContainer: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
  },
  groupCard: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  groupCardGradient: {
    padding: theme.spacing.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  groupIconContainer: {
    ...theme.shadows.small,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  
  // Group Details
  groupDetails: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  detailLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Facebook CTA
  facebookCTA: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  facebookCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  facebookCTAText: {
    ...theme.typography.button,
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
  },
  
  // Facebook Section
  facebookSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  facebookLinksContainer: {
    gap: theme.spacing.lg,
  },
  facebookLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  facebookLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#1877F2' + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookLinkText: {
    flex: 1,
  },
  facebookLinkTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  facebookLinkSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

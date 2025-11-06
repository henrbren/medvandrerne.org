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

  const handleFacebookPress = (url) => {
    if (url) {
      Linking.openURL(url);
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
        {/* Header Section */}
        <AnimatedSection>
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="people" size={40} color={theme.colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Lokallagene våre</Text>
            <Text style={styles.headerDescription}>
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
  
  // Header Section
  headerSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glowSubtle,
  },
  headerIconGradient: {
    width: 88,
    height: 88,
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

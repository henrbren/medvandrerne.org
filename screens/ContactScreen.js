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
import {
  ADMINISTRATION,
  BOARD,
  ORGANIZATION_INFO,
} from '../constants/data';

const isWeb = Platform.OS === 'web';

export default function ContactScreen({ navigation }) {
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

  const handlePersonPress = (person, type) => {
    navigation.navigate('PersonDetail', { person, type });
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

        {/* Administration Section */}
        <AnimatedSection>
          <View style={styles.administrationSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="business" size={32} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Administrasjon</Text>
            </View>
            
            <View style={styles.contactsList}>
              {ADMINISTRATION.map((person, index) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.contactCard}
                  onPress={() => handlePersonPress(person, 'administration')}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactCardContent}>
                    {person.image ? (
                      <View style={styles.contactImageHeader}>
                        <Image 
                          source={person.image} 
                          style={styles.contactHeaderImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View style={styles.contactHeaderPlaceholder}>
                        <LinearGradient
                          colors={[theme.colors.primary + '40', theme.colors.primary + '20']}
                          style={styles.contactHeaderPlaceholderGradient}
                        >
                          <Icon name="person-circle" size={60} color={theme.colors.primary} />
                        </LinearGradient>
                      </View>
                    )}
                    
                    <View style={styles.contactCardBody}>
                      <View style={styles.contactHeader}>
                        <View style={styles.contactInfo}>
                          <Text style={styles.contactRole}>{person.role}</Text>
                          <Text style={styles.contactName}>{person.name}</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
                      </View>

                      {(person.phone || person.email) && (
                        <View style={styles.contactActions}>
                          {person.phone && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handlePhonePress(person.phone);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '20' }]}>
                                <Icon name="call" size={20} color={theme.colors.success} />
                              </View>
                              <Text style={styles.actionText}>{person.phone}</Text>
                            </TouchableOpacity>
                          )}

                          {person.email && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleEmailPress(person.email);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
                                <Icon name="mail" size={20} color={theme.colors.info} />
                              </View>
                              <Text style={styles.actionText}>{person.email}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedSection>

        {/* Board Section */}
        <AnimatedSection delay={100}>
          <View style={styles.boardSection}>
            <View style={styles.sectionHeader}>
              <Icon name="people" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Styret</Text>
            </View>
            
            {/* Board Leader */}
            <TouchableOpacity
              style={styles.boardLeaderCard}
              onPress={() => handlePersonPress({ name: BOARD.leader, role: 'Styreleder', image: BOARD.leaderImage }, 'board')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.boardLeaderGradient}
              >
                <View style={styles.leaderIconContainer}>
                  {BOARD.leaderImage ? (
                    <Image 
                      source={BOARD.leaderImage} 
                      style={styles.leaderImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name="trophy" size={32} color={theme.colors.white} />
                  )}
                </View>
                <View style={styles.leaderInfo}>
                  <Text style={styles.leaderRole}>Styreleder</Text>
                  <Text style={styles.leaderName}>{BOARD.leader}</Text>
                </View>
                <Icon name="chevron-forward" size={24} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Board Members */}
            <View style={styles.boardMembersContainer}>
              <Text style={styles.subsectionTitle}>Styremedlemmer</Text>
              <View style={styles.membersList}>
                {BOARD.members.map((member, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.memberCard}
                    onPress={() => handlePersonPress({ name: member.name, role: 'Styremedlem', image: member.image }, 'board')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memberIconContainer}>
                      {member.image ? (
                        <Image 
                          source={member.image} 
                          style={styles.memberImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Icon name="person" size={20} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Organization Information */}
        <AnimatedSection delay={200}>
          <View style={styles.organizationSection}>
            <View style={styles.sectionHeader}>
              <Icon name="information-circle" size={28} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Organisasjonsinformasjon</Text>
            </View>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="business" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Org.nr</Text>
                  <Text style={styles.infoValue}>{ORGANIZATION_INFO.orgNumber}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="card" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Bankkonto</Text>
                  <Text style={styles.infoValue}>{ORGANIZATION_INFO.bankAccount}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="phone-portrait" size={24} color={theme.colors.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>VIPPS</Text>
                  <Text style={styles.infoValue}>{ORGANIZATION_INFO.vipps}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="location" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Adresse</Text>
                  <Text style={styles.infoValue}>{ORGANIZATION_INFO.address}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.infoItem}
                onPress={async () => await WebBrowser.openBrowserAsync(ORGANIZATION_INFO.website)}
                activeOpacity={0.7}
              >
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Icon name="globe" size={24} color={theme.colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nettsted</Text>
                  <Text style={[styles.infoValue, styles.infoLink]}>{ORGANIZATION_INFO.website}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedSection>

        {/* Support CTA */}
        <AnimatedSection delay={300}>
          <View style={styles.supportSection}>
            <TouchableOpacity
              style={styles.supportCTA}
              onPress={async () => await WebBrowser.openBrowserAsync('https://spleis.no/medvandrerne')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.supportCTAGradient}
              >
                <View style={styles.supportIconContainer}>
                  <Icon name="heart" size={32} color={theme.colors.white} />
                </View>
                <View style={styles.supportTextContainer}>
                  <Text style={styles.supportTitle}>Støtt på Spleis.no</Text>
                  <Text style={styles.supportSubtitle}>
                    Vi setter stor pris på all støtte
                  </Text>
                </View>
                <Icon name="arrow-forward" size={28} color={theme.colors.white} />
              </LinearGradient>
            </TouchableOpacity>
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
  
  // Administration Section
  administrationSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  contactsList: {
    gap: theme.spacing.lg,
  },
  contactCard: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  contactCardContent: {
    overflow: 'hidden',
  },
  contactImageHeader: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  contactHeaderImage: {
    width: '100%',
    height: '100%',
  },
  contactHeaderPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactHeaderPlaceholderGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCardBody: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactRole: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  contactName: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  
  // Contact Actions
  contactActions: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  // Board Section
  boardSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  boardLeaderCard: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow,
  },
  boardLeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  leaderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderRole: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leaderName: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  
  // Board Members
  boardMembersContainer: {
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
    marginBottom: theme.spacing.md,
  },
  membersList: {
    gap: theme.spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  memberIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '500',
  },
  
  // Organization Section
  organizationSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  infoList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  infoLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Support Section
  supportSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  supportCTA: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  supportCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl + theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    ...theme.typography.buttonLarge,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  supportSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    opacity: 0.9,
  },
  
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

import React, { useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { useAppData } from '../contexts/AppDataContext';
import { useRegistrations } from '../hooks/useRegistrations';
import { useFavorites } from '../hooks/useFavorites';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen({ navigation }) {
  const { data, loading: dataLoading, refreshData } = useAppData();
  const { registrations, loading, loadRegistrations } = useRegistrations();
  const { favoriteContacts, favoriteGroups, loadFavorites } = useFavorites();
  const { stats: activityStats } = useActivityStats();
  const { getStats: getMasteryStats } = useMasteryLog();
  const hasAnimatedRef = useRef(false);

  // Extract data from context
  const ORGANIZATION_INFO = data.organization;
  const MISSION = data.mission;
  const CORE_ACTIVITIES = data.coreActivities;
  const SAMPLE_ACTIVITIES = data.activities;
  const ADMINISTRATION = data.administration;
  const BOARD = data.board;
  const LOCAL_GROUPS = data.localGroups;
  const NEWS = data.news || [];

  // AnimatedSection component - checks shared ref to prevent re-animation
  const AnimatedSection = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(hasAnimatedRef.current ? 1 : 0)).current;
    const cardSlide = useRef(new Animated.Value(hasAnimatedRef.current ? 0 : 20)).current;

    useEffect(() => {
      // Only animate if we haven't animated before
      if (!hasAnimatedRef.current) {
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
        ]).start(() => {
          // Mark as animated after the longest delay completes
          setTimeout(() => {
            hasAnimatedRef.current = true;
          }, delay + theme.animations.normal);
        });
      }
    }, [delay]);

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

  // Refresh registrations and favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
      loadFavorites();
    }, [])
  );

  // Get registered activities
  const registeredActivities = SAMPLE_ACTIVITIES.filter(activity => 
    registrations.includes(activity.id)
  );

  // Get favorite contacts (from ADMINISTRATION and BOARD)
  const allContacts = [
    ...ADMINISTRATION,
    ...(BOARD.leader ? [{ id: `board-leader`, name: BOARD.leader, role: 'Styreleder' }] : []),
    ...BOARD.members.map((member, index) => ({ 
      id: `board-${index}`, 
      name: member.name, 
      role: 'Styremedlem',
      image: member.image 
    }))
  ];
  const favoriteContactObjects = allContacts.filter(contact => 
    favoriteContacts.includes(contact.id)
  );
  
  // Get all contacts for social network section (limit to 6 for preview)
  const previewContacts = allContacts.slice(0, 6);

  // Get favorite groups
  const favoriteGroupObjects = LOCAL_GROUPS.filter(group => 
    favoriteGroups.includes(group.id)
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

  const handlePress = (url) => {
    Linking.openURL(url);
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
                <Text style={styles.heroTitle}>Medvandrerne</Text>
                <Text style={styles.heroSubtitle}>Vi vandrer sammen</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* My Registrations */}
        {registeredActivities.length > 0 && (
          <AnimatedSection delay={100}>
            <View style={styles.registrationsSection}>
              <View style={styles.sectionHeaderMinimal}>
                <LinearGradient
                  colors={[theme.colors.success, '#4AE85C']}
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
                    <View style={styles.registrationCardHeader}>
                      <View style={styles.registrationAvatarContainer}>
                        <LinearGradient
                          colors={[theme.colors.success, '#4AE85C']}
                          style={styles.registrationAvatar}
                        >
                          <Icon name={getActivityIcon(activity.type)} size={28} color={theme.colors.white} />
                        </LinearGradient>
                        <View style={styles.registrationBadge}>
                          <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                        </View>
                      </View>
                      <View style={styles.registrationHeaderContent}>
                        <Text style={styles.registrationTitle}>{activity.title}</Text>
                        <View style={styles.registrationMeta}>
                          <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.registrationDate}>
                            {formatDate(activity.date)}
                            {activity.time && ` • ${activity.time}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {activity.location && activity.location !== 'Har ikke sted' && (
                      <View style={styles.registrationFooter}>
                        <Icon name="location-outline" size={14} color={theme.colors.textTertiary} />
                        <Text style={styles.registrationLocation} numberOfLines={1}>
                          {activity.location}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedSection>
        )}

        {/* Quick Link to My Journey */}
        <AnimatedSection delay={registeredActivities.length > 0 ? 200 : 100}>
          <TouchableOpacity
            style={styles.myJourneyCard}
            onPress={() => navigation.navigate('Min vandring')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.myJourneyGradient}
            >
              <View style={styles.myJourneyContent}>
                <View style={styles.myJourneyIconContainer}>
                  <Icon name="map" size={32} color={theme.colors.white} />
                </View>
                <View style={styles.myJourneyTextContainer}>
                  <Text style={styles.myJourneyTitle}>Min vandring</Text>
                  <Text style={styles.myJourneySubtitle}>
                    Se din personlige fremgang og refleksjoner
                  </Text>
                </View>
                <Icon name="chevron-forward" size={24} color={theme.colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedSection>

        {/* News Section */}
        {NEWS.length > 0 && (
          <AnimatedSection delay={registeredActivities.length > 0 ? 300 : 200}>
            <View style={styles.newsSection}>
              <View style={styles.newsSectionHeader}>
                <View style={[styles.sectionHeaderMinimal, { marginBottom: 0 }]}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.headerIconGradient}
                  >
                    <Icon name="newspaper" size={28} color={theme.colors.white} />
                  </LinearGradient>
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitleLarge}>Nyheter</Text>
                    <Text style={styles.sectionSubtitle}>Siste nytt</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('News')}
                  activeOpacity={0.7}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllLink}>Se alle</Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              
              {/* Latest News Preview */}
              {NEWS.slice(0, 2).map((newsItem, index) => (
                <TouchableOpacity
                  key={newsItem.id || index}
                  style={styles.newsCard}
                  onPress={() => navigation.navigate('NewsDetail', { newsItem })}
                  activeOpacity={0.7}
                >
                  {newsItem.image ? (
                    <Image 
                      source={{ uri: newsItem.image }}
                      style={styles.newsCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.newsCardImagePlaceholder}>
                      <Icon name="newspaper" size={24} color={theme.colors.textTertiary} />
                    </View>
                  )}
                  <View style={styles.newsCardContent}>
                    <Text style={styles.newsCardTitle} numberOfLines={2}>{newsItem.title}</Text>
                    {newsItem.excerpt && (
                      <Text style={styles.newsCardExcerpt} numberOfLines={2}>{newsItem.excerpt}</Text>
                    )}
                    <Text style={styles.newsCardDate}>
                      {newsItem.date ? new Date(newsItem.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }) : ''}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedSection>
        )}

        {/* Mission Statement - No card, more space */}
        <AnimatedSection delay={registeredActivities.length > 0 ? 300 : 200}>
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
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  heroImageContainer: {
    width: '100%',
    height: isWeb ? 360 : 340,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: isWeb ? theme.spacing.xxxl * 2 : theme.spacing.xxxl * 1.5,
    paddingBottom: theme.spacing.xxl,
    zIndex: 2,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.sm,
    ...theme.shadows.small,
    zIndex: 3,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    ...theme.typography.h2,
    fontSize: isWeb ? 28 : 26,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
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
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    zIndex: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    ...(isWeb && {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    }),
  },
  registrationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isWeb && {
      width: 'calc(50% - 12px)',
      maxWidth: 500,
      minWidth: 300,
    }),
  },
  registrationCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  registrationAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  registrationAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  registrationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  registrationHeaderContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  registrationTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
  registrationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  registrationLocation: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
    flex: 1,
  },
  
  // Favorites Section
  favoritesSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  favoritesList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...(isWeb && {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    }),
  },
  favoriteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...(isWeb && {
      width: 'calc(50% - 12px)',
      maxWidth: 500,
      minWidth: 300,
    }),
  },
  favoriteCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  favoriteAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  favoriteAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.small,
  },
  favoriteAvatarGradient: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  favoriteBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  favoriteHeaderContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  favoriteActionButton: {
    paddingTop: theme.spacing.xs,
  },
  favoriteTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  favoriteSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  favoriteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  favoriteContactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    flex: 1,
  },
  favoriteContactText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
    flex: 1,
  },
  
  // Contacts Network Section
  // News Section
  newsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  newsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  newsCardImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
  },
  newsCardImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsCardContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  newsCardTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  newsCardExcerpt: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  newsCardDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  
  // Contacts Section
  contactsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  contactsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingLeft: theme.spacing.md,
  },
  seeAllLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  contactCard: {
    width: 'calc(33.333% - 12px)',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
    ...(isWeb && {
      width: 'calc(16.666% - 12px)',
      minWidth: 80,
      maxWidth: 100,
    }),
  },
  contactAvatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  contactAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  contactAvatarGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  contactFavoriteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  contactName: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  contactRole: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // My Journey Card
  myJourneyCard: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  myJourneyGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  myJourneyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  myJourneyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myJourneyTextContainer: {
    flex: 1,
  },
  myJourneyTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  myJourneySubtitle: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    color: theme.colors.white,
    opacity: 0.9,
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

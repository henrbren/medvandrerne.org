import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityStats } from '../../hooks/useActivityStats';
import { useMasteryLog } from '../../hooks/useMasteryLog';
import { useGamification } from '../../hooks/useGamification';
import { useActivityTracking } from '../../hooks/useActivityTracking';
import { useSkills, SKILLS } from '../../hooks/useSkills';
import MembershipSelector from '../MembershipSelector';
import QRCodeModal from './QRCodeModal';
import { useContacts } from '../../hooks/useContacts';

const { width } = Dimensions.get('window');

// Get level name from level number
function getLevelName(level) {
  const names = {
    1: 'Nybegynner',
    2: 'Speider',
    3: 'Vandrer',
    4: 'Stifinner',
    5: 'Oppdager',
    6: 'Utforsker',
    7: 'Eventyrer',
    8: 'Pioner',
    9: 'Ekspert',
    10: 'Mester',
  };
  return names[Math.min(level, 10)] || `Nivå ${level}`;
}

// Førerkort Component - The Hero Card
function Forerkort({ user, localStats, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalPoints = Math.max(user.totalPoints || 0, localStats?.totalPoints || 0);
  const completedActivitiesCount = Math.max(user.completedActivities || 0, localStats?.completedActivities || 0);
  const completedExpeditions = Math.max(user.completedExpeditions || 0, localStats?.completedExpeditions || 0);
  const displayLevel = Math.max(user.level || 1, localStats?.level || 1);
  const levelName = getLevelName(displayLevel);

  const levelColors = {
    1: ['#9E9E9E', '#757575'],
    2: ['#42A5F5', '#1E88E5'],
    3: ['#66BB6A', '#43A047'],
    4: ['#FFA726', '#FB8C00'],
    5: ['#EC407A', '#D81B60'],
  };

  const colorLevel = Math.min(displayLevel, 5);
  const colors = levelColors[colorLevel] || levelColors[1];

  return (
    <Animated.View
      style={[
        styles.forerkortContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.forerkort}
        >
          {/* Header */}
          <View style={styles.forerkortHeader}>
            <View style={styles.forerkortLogo}>
              <Icon name="walk" size={24} color={theme.colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.forerkortTitle}>MEDVANDRERNE</Text>
              <Text style={styles.forerkortSubtitle}>Vandrerbevis</Text>
            </View>
            <View style={styles.forerkortQRHint}>
              <Icon name="qr-code" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.forerkortContent}>
            <View style={styles.forerkortAvatar}>
              {user.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  style={styles.forerkortAvatarImage}
                />
              ) : (
                <Text style={styles.forerkortAvatarText}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </Text>
              )}
            </View>
            <View style={styles.forerkortInfo}>
              <Text style={styles.forerkortName}>{user.name || 'Vandrer'}</Text>
              <View style={styles.forerkortLevel}>
                <Icon name="shield-checkmark-outline" size={16} color={theme.colors.white} />
                <Text style={styles.forerkortLevelText}>
                  Nivå {displayLevel}: {levelName}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.forerkortStats}>
            <View style={styles.forerkortStat}>
              <Text style={styles.forerkortStatValue}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.forerkortStatLabel}>XP</Text>
            </View>
            <View style={styles.forerkortStatDivider} />
            <View style={styles.forerkortStat}>
              <Text style={styles.forerkortStatValue}>{completedActivitiesCount}</Text>
              <Text style={styles.forerkortStatLabel}>Aktiviteter</Text>
            </View>
            <View style={styles.forerkortStatDivider} />
            <View style={styles.forerkortStat}>
              <Text style={styles.forerkortStatValue}>{completedExpeditions}</Text>
              <Text style={styles.forerkortStatLabel}>Ekspedisjoner</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.forerkortFooter}>
            <Text style={styles.forerkortDate}>
              {user.memberSince && new Date(user.memberSince).getFullYear() > 2000
                ? `Medlem siden ${new Date(user.memberSince).toLocaleDateString('nb-NO', {
                    month: 'long',
                    year: 'numeric',
                  })}`
                : user.createdAt && new Date(user.createdAt).getFullYear() > 2000
                  ? `Registrert ${new Date(user.createdAt).toLocaleDateString('nb-NO', {
                      month: 'long',
                      year: 'numeric',
                    })}`
                  : 'Ny medvandrer'
              }
            </Text>
            <Text style={styles.forerkortId}>{user.id?.slice(-8).toUpperCase()}</Text>
          </View>

          {/* Holographic Effect */}
          <View style={styles.holographicOverlay} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Login Flow Component
function LoginFlow({ onComplete, loading: authLoading }) {
  const { selectMembership, login } = useAuth();
  const [step, setStep] = useState('membership');
  const [selectedTier, setSelectedTier] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMembershipSelect = (tierId) => {
    setSelectedTier(tierId);
    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    if (phone.trim().length < 8) {
      Alert.alert('Ugyldig nummer', 'Vennligst oppgi et gyldig telefonnummer');
      return;
    }

    setLoading(true);
    const result = await selectMembership(phone.trim(), selectedTier);
    setLoading(false);

    if (result.success) {
      setStep('pending');
    } else {
      Alert.alert('Feil', result.error);
    }
  };

  const handleExistingLogin = async () => {
    if (phone.trim().length < 8) {
      Alert.alert('Ugyldig nummer', 'Vennligst oppgi et gyldig telefonnummer');
      return;
    }

    setLoading(true);
    const result = await login(phone.trim());
    setLoading(false);

    if (result.success) {
      onComplete(result);
    } else {
      Alert.alert('Feil', result.error);
    }
  };

  if (step === 'membership') {
    return (
      <MembershipSelector
        onSelect={handleMembershipSelect}
        onBack={() => {}}
        phone={phone}
      />
    );
  }

  if (step === 'phone') {
    return (
      <KeyboardAvoidingView 
        style={styles.loginContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.loginHeader}
          >
            <Icon name="person-add-outline" size={80} color={theme.colors.white} />
            <Text style={styles.loginTitle}>Opprett konto</Text>
            <Text style={styles.loginSubtitle}>
              Skriv inn telefonnummeret ditt for å fullføre registreringen
            </Text>
          </LinearGradient>

          <View style={styles.loginForm}>
            <Text style={styles.inputLabel}>Telefonnummer</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+47</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="12345678"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={8}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Registrerer...' : 'Fortsett'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backLink}
              onPress={() => setStep('membership')}
            >
              <Icon name="arrow-back" size={16} color={theme.colors.primary} />
              <Text style={styles.backLinkText}>Tilbake til medlemskap</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>eller</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.existingButton}
              onPress={handleExistingLogin}
              disabled={loading}
            >
              <Text style={styles.existingButtonText}>Har du allerede konto? Logg inn</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'pending') {
    return (
      <View style={styles.loginContainer}>
        <LinearGradient
          colors={[theme.colors.warning, '#FFD60A']}
          style={styles.loginHeader}
        >
          <Icon name="time-outline" size={80} color={theme.colors.white} />
          <Text style={styles.loginTitle}>Venter på betaling</Text>
          <Text style={styles.loginSubtitle}>
            Fullfør betalingen for å aktivere medlemskapet ditt
          </Text>
        </LinearGradient>

        <View style={styles.loginForm}>
          <View style={styles.pendingCard}>
            <Icon name="card-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.pendingTitle}>Betaling</Text>
            <Text style={styles.pendingText}>
              Vipps og kortbetaling kommer snart. Kontakt oss for manuell betaling.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => onComplete({ success: true })}
          >
            <Text style={styles.refreshButtonText}>Gå til profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

// Simplified Profile Dashboard
function ProfileDashboard({ 
  user, 
  localStats, 
  navigation, 
  onClose,
  onShowQRCode, 
  completedSkillIds,
  onRefresh,
  refreshing,
  onLogout,
}) {
  const completedSkillsCount = completedSkillIds?.length || 0;

  const menuItems = [
    {
      id: 'profile-info',
      icon: 'person',
      iconColor: theme.colors.primary,
      title: 'Profilinformasjon',
      subtitle: 'Navn, e-post og profilbilde',
      route: 'ProfileInfo',
    },
    {
      id: 'qr-code',
      icon: 'qr-code',
      iconColor: theme.colors.info,
      title: 'Min Medvandrerkode',
      subtitle: 'Del eller scan koder',
      action: onShowQRCode,
    },
    {
      id: 'skills',
      icon: 'trophy',
      iconColor: theme.colors.warning,
      title: 'Ferdigheter',
      subtitle: completedSkillsCount > 0 
        ? `${completedSkillsCount} fullført${completedSkillsCount > 1 ? 'e' : ''}` 
        : 'Se dine ferdigheter',
      route: 'Skills',
    },
    {
      id: 'settings',
      icon: 'settings',
      iconColor: theme.colors.textSecondary,
      title: 'Innstillinger',
      subtitle: 'Synkronisering og konto',
      route: 'ProfileSettings',
    },
  ];

  const handleMenuPress = (item) => {
    if (item.action) {
      item.action();
    } else if (item.route && navigation) {
      onClose();
      navigation.navigate(item.route);
    }
  };

  return (
    <ScrollView 
      style={styles.profileContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Førerkort - Hero Card */}
      <View style={styles.heroSection}>
        <Forerkort user={user} localStats={localStats} onPress={onShowQRCode} />
      </View>

      {/* Membership Status (compact) */}
      {user.membership && (
        <TouchableOpacity 
          style={styles.membershipBanner}
          onPress={() => {
            onClose();
            navigation?.navigate('Membership');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.membershipBannerIcon}>
            <Icon name="ribbon" size={18} color={theme.colors.white} />
          </View>
          <View style={styles.membershipBannerContent}>
            <Text style={styles.membershipBannerTitle}>{user.membership.tierName}</Text>
            <Text style={styles.membershipBannerStatus}>
              {user.membership.status === 'active' ? 'Aktivt medlemskap' : 
               user.membership.status === 'pending' ? 'Venter på betaling' : 
               'Medlemskap utløpt'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      {/* Navigation Menu */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: item.iconColor + '15' }]}>
                <Icon name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Icon name="log-out" size={20} color={theme.colors.error} />
          <Text style={styles.logoutButtonText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Main Modal Component
export default function ProfileModal({ visible, onClose, navigation, initialOpenScanner = false }) {
  const { user, loading, isAuthenticated, login, logout, refreshUserData } = useAuth();
  const { stats: activityStats } = useActivityStats();
  const { getStats: getMasteryStats } = useMasteryLog();
  const { getStats: getTrackingStats } = useActivityTracking();
  const { completedSkills, getStats: getSkillsStats, getTotalXPEarned } = useSkills();
  const { addContact } = useContacts();
  const [showQRModal, setShowQRModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible && initialOpenScanner && isAuthenticated) {
      setShowQRModal(true);
    }
  }, [visible, initialOpenScanner, isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  useEffect(() => {
    if (visible && isAuthenticated) {
      refreshUserData();
    }
  }, [visible, isAuthenticated]);

  const handleQRScanSuccess = async (contactData) => {
    const result = await addContact(contactData);
    if (result.success) {
      Alert.alert(
        result.isUpdate ? 'Kontakt oppdatert!' : 'Kontakt lagt til!',
        `${contactData.name || 'Medvandrer'} er nå i din Flokken-liste.`,
        [
          { 
            text: 'Se Flokken', 
            onPress: () => {
              onClose();
              navigation?.navigate('Flokken');
            } 
          }, 
          { text: 'OK' }
        ]
      );
    }
  };

  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();

  const combinedStats = React.useMemo(() => ({
    totalActivities: activityStats?.totalActivities || 0,
    totalCompletedActivities: activityStats?.totalCompletedActivities || 0,
    totalRegistrations: activityStats?.totalRegistrations || 0,
    totalReflections: masteryStats?.totalEntries || 0,
    totalMoments: masteryStats?.totalMoments || 0,
    currentStreak: activityStats?.currentStreak || 0,
    totalExpeditions: trackingStats?.totalExpeditions || 0,
    totalEnvironmentActions: trackingStats?.totalEnvironmentActions || 0,
    totalSkills: skillsStats?.completedSkills || 0,
    skillsXP: skillsXP || 0,
  }), [activityStats, masteryStats, trackingStats, skillsStats, skillsXP]);

  const { level, totalXP } = useGamification(combinedStats);

  const localStats = {
    totalPoints: totalXP || 0,
    completedActivities: (activityStats?.totalCompletedActivities || 0) + (skillsStats?.completedSkills || 0),
    completedExpeditions: trackingStats?.totalExpeditions || 0,
    level: level || 1,
  };

  const handleLogout = () => {
    Alert.alert('Logg ut', 'Er du sikker på at du vil logge ut?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logg ut',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Min Profil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Icon name="hourglass-outline" size={48} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Laster...</Text>
            </View>
          ) : isAuthenticated ? (
            <ProfileDashboard
              user={user}
              localStats={localStats}
              navigation={navigation}
              onClose={onClose}
              onShowQRCode={() => setShowQRModal(true)}
              completedSkillIds={completedSkills}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onLogout={handleLogout}
            />
          ) : (
            <LoginFlow onComplete={() => {}} loading={loading} />
          )}
        </KeyboardAvoidingView>

        {/* QR Code Modal */}
        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          user={user}
          localStats={localStats}
          onScanSuccess={handleQRScanSuccess}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  // Førerkort
  forerkortContainer: {},
  forerkort: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    aspectRatio: 1.6,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  forerkortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  forerkortLogo: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forerkortTitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: 2,
  },
  forerkortSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
  },
  forerkortQRHint: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.md,
  },
  forerkortContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  forerkortAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  forerkortAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  forerkortAvatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 28,
  },
  forerkortInfo: {
    flex: 1,
  },
  forerkortName: {
    ...theme.typography.h2,
    color: theme.colors.white,
    fontSize: 20,
  },
  forerkortLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  forerkortLevelText: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
  },
  forerkortStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  forerkortStat: {
    alignItems: 'center',
  },
  forerkortStatValue: {
    ...theme.typography.title,
    color: theme.colors.white,
    fontSize: 18,
  },
  forerkortStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  forerkortStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  forerkortFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  forerkortDate: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  forerkortId: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  holographicOverlay: {
    position: 'absolute',
    top: 0,
    right: -50,
    width: 150,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '15deg' }],
  },

  // Membership Banner
  membershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  membershipBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipBannerContent: {
    flex: 1,
  },
  membershipBannerTitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  membershipBannerStatus: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.error + '15',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  logoutButtonText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },

  // Login Styles
  loginContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loginHeader: {
    padding: theme.spacing.xxxl,
    paddingTop: theme.spacing.xxxl + 20,
    alignItems: 'center',
  },
  loginTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
  },
  loginSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  loginForm: {
    padding: theme.spacing.xl,
    marginTop: -theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  phonePrefix: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  phoneInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loginButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  backLinkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.md,
  },
  existingButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  existingButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  pendingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  pendingTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  pendingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  refreshButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },

  bottomSpacer: {
    height: theme.spacing.xxxl,
  },
});

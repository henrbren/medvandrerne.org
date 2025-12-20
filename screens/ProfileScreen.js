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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';
import { useGamification } from '../hooks/useGamification';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useSkills, SKILLS } from '../hooks/useSkills';
import MembershipSelector from '../components/MembershipSelector';
import QRCodeModal from '../components/modals/QRCodeModal';
import { useContacts } from '../hooks/useContacts';

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
    7: 'Eventyrper',
    8: 'Pioner',
    9: 'Ekspert',
    10: 'Mester',
  };
  return names[Math.min(level, 10)] || `Nivå ${level}`;
}

// Førerkort Component
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

  // Merge local and server stats - use the higher value
  const totalPoints = Math.max(user.totalPoints || 0, localStats?.totalPoints || 0);
  const completedActivitiesCount = Math.max(user.completedActivities || 0, localStats?.completedActivities || 0);
  const completedExpeditions = Math.max(user.completedExpeditions || 0, localStats?.completedExpeditions || 0);
  
  // Use local level if higher than server level
  const displayLevel = Math.max(user.level || 1, localStats?.level || 1);
  const levelName = getLevelName(displayLevel);

  const levelColors = {
    1: ['#9E9E9E', '#757575'],
    2: ['#42A5F5', '#1E88E5'],
    3: ['#66BB6A', '#43A047'],
    4: ['#FFA726', '#FB8C00'],
    5: ['#EC407A', '#D81B60'],
  };

  // Cap colors at level 5 for gradient
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
            {/* QR Code hint */}
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
              Medlem siden {new Date(user.memberSince).toLocaleDateString('nb-NO', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.forerkortId}>{user.id?.slice(-8).toUpperCase()}</Text>
          </View>

          {/* Tap hint */}
          <View style={styles.forerkortTapHint}>
            <Text style={styles.forerkortTapHintText}>Trykk for QR-kode</Text>
          </View>

          {/* Holographic Effect */}
          <View style={styles.holographicOverlay} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Login Flow Component - handles membership selection and registration
function LoginFlow({ onComplete, loading: authLoading }) {
  const { selectMembership, login } = useAuth();
  const [step, setStep] = useState('membership'); // 'membership', 'phone', 'pending'
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

  // Step 1: Membership Selection
  if (step === 'membership') {
    return (
      <MembershipSelector
        onSelect={handleMembershipSelect}
        onBack={() => {}}
        phone={phone}
      />
    );
  }

  // Step 2: Phone Input
  if (step === 'phone') {
    return (
      <View style={styles.loginContainer}>
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
              {loading ? (
                <Text style={styles.loginButtonText}>Registrerer...</Text>
              ) : (
                <>
                  <Icon name="arrow-forward" size={20} color={theme.colors.white} />
                  <Text style={styles.loginButtonText}>Fortsett</Text>
                </>
              )}
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
      </View>
    );
  }

  // Step 3: Pending Payment
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

          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Kontakt oss:</Text>
            <Text style={styles.contactText}>post@medvandrerne.no</Text>
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

// Profile View Component
function ProfileView({ user, localStats, onLogout, onSync, onUpdateProfile, onUploadAvatar, onShowQRCode, onMembershipPress, syncing, completedSkillIds }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get full skill data for completed skills
  const completedSkillsData = (completedSkillIds || []).map(skillId => {
    const skill = SKILLS.find(s => s.id === skillId);
    return skill || null;
  }).filter(Boolean);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tillatelse kreves', 'Vi trenger tilgang til bildegalleriet for å laste opp profilbilde.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingAvatar(true);
      const uploadResult = await onUploadAvatar(result.assets[0].uri);
      setUploadingAvatar(false);
      
      if (uploadResult.success) {
        Alert.alert('Suksess', 'Profilbildet er oppdatert!');
      } else {
        Alert.alert('Feil', uploadResult.error || 'Kunne ikke laste opp bildet');
      }
    }
  };

  const handleSave = async () => {
    const result = await onUpdateProfile({ name, email });
    if (result.success) {
      setEditing(false);
      Alert.alert('Lagret', 'Profilen din er oppdatert');
    } else {
      Alert.alert('Feil', result.error);
    }
  };

  // Check if local data is newer than server data
  const hasUnsyncedProgress = (localStats?.totalPoints || 0) > (user.totalPoints || 0) ||
    (localStats?.completedActivities || 0) > (user.completedActivities || 0);

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth >= 768;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentWrapper, isTablet && styles.contentWrapperTablet]}>
        {/* Cards Row - Side by side on tablet */}
        <View style={[styles.cardsRow, isTablet && styles.cardsRowTablet]}>
          {/* Førerkort */}
          <View style={[styles.cardWrapper, isTablet && styles.cardWrapperTablet]}>
            <Forerkort user={user} localStats={localStats} onPress={onShowQRCode} />
            {hasUnsyncedProgress && (
              <View style={styles.unsyncedBanner}>
                <Icon name="cloud-upload-outline" size={16} color={theme.colors.warning} />
                <Text style={styles.unsyncedText}>Du har usynkronisert fremgang</Text>
              </View>
            )}
          </View>

          {/* Membership Status */}
          {user.membership && (
            <View style={[styles.cardWrapper, isTablet && styles.cardWrapperTablet]}>
              <TouchableOpacity onPress={onMembershipPress} activeOpacity={0.8}>
                <View style={styles.membershipCard}>
                  <View style={styles.membershipHeader}>
                    <Icon name="ribbon-outline" size={24} color={theme.colors.white} />
                    <Text style={styles.membershipTitle}>{user.membership.tierName}</Text>
                    <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </View>
                  <View style={styles.membershipBody}>
                    <View style={styles.membershipRow}>
                      <Text style={styles.membershipLabel}>Status:</Text>
                      <View style={[
                        styles.membershipStatusBadge,
                        user.membership.status === 'active' && styles.membershipStatusActive,
                        user.membership.status === 'pending' && styles.membershipStatusPending,
                      ]}>
                        <Text style={styles.membershipStatusText}>
                          {user.membership.status === 'active' ? 'Aktiv' : 
                           user.membership.status === 'pending' ? 'Venter på betaling' : 
                           'Utløpt'}
                        </Text>
                      </View>
                    </View>
                    {user.membership.status === 'active' && user.membership.expiresAt && (
                      <View style={styles.membershipRow}>
                        <Text style={styles.membershipLabel}>Utløper:</Text>
                        <Text style={styles.membershipValue}>
                          {new Date(user.membership.expiresAt).toLocaleDateString('nb-NO')}
                        </Text>
                      </View>
                    )}
                    <View style={styles.membershipRow}>
                      <Text style={styles.membershipLabel}>Pris:</Text>
                      <Text style={styles.membershipValue}>{user.membership.price} kr/mnd</Text>
                    </View>
                  </View>
                  <View style={styles.membershipTapHint}>
                    <Text style={styles.membershipTapHintText}>Trykk for å endre</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="person" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Profilinformasjon</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                <Icon name="create" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Navn</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ditt navn"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-post</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="din@epost.no"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setName(user.name || '');
                    setEmail(user.email || '');
                    setEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Lagre</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              {/* Avatar Upload */}
              <TouchableOpacity style={styles.avatarSection} onPress={pickImage} disabled={uploadingAvatar}>
                <View style={styles.avatarContainer}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  ) : user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="person" size={40} color={theme.colors.textTertiary} />
                    </View>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Icon name="camera" size={14} color={theme.colors.white} />
                  </View>
                </View>
                <Text style={styles.avatarHint}>Trykk for å endre bilde</Text>
              </TouchableOpacity>

              <View style={styles.infoRow}>
                <Icon name="call" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Telefon:</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="person" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Navn:</Text>
                <Text style={styles.infoValue}>{user.name || 'Ikke oppgitt'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="mail" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>E-post:</Text>
                <Text style={styles.infoValue}>{user.email || 'Ikke oppgitt'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Skills */}
        {completedSkillsData.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="trophy-outline" size={24} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Ferdigheter ({completedSkillsData.length})</Text>
            </View>
            <View style={styles.skillsGrid}>
              {completedSkillsData.map((skill) => (
                <View key={skill.id} style={styles.skillBadge}>
                  <Icon name={skill.icon} size={16} color={theme.colors.white} style={styles.skillIcon} />
                  <Text style={styles.skillName}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="star-outline" size={24} color={theme.colors.success} />
              <Text style={styles.sectionTitle}>Merker</Text>
            </View>
            <View style={styles.badgesGrid}>
              {user.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Icon name="star" size={24} color={theme.colors.warning} />
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* QR Code / Medvandrerkode */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.qrButton} onPress={onShowQRCode}>
            <View style={styles.qrButtonIcon}>
              <Icon name="qr-code" size={24} color={theme.colors.white} />
            </View>
            <View style={styles.qrButtonContent}>
              <Text style={styles.qrButtonTitle}>Min Medvandrerkode</Text>
              <Text style={styles.qrButtonSubtitle}>Del eller scan koder med andre</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sync Progress */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
            onPress={onSync}
            disabled={syncing}
          >
            <Icon name="cloud-upload" size={20} color={theme.colors.white} />
            <Text style={styles.syncButtonText}>
              {syncing ? 'Synkroniserer...' : 'Synkroniser fremgang'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.syncNote}>
            Last opp din lokale fremgang fra "Min vandring" til skyen
          </Text>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Icon name="log-out" size={20} color={theme.colors.error} />
            <Text style={styles.logoutButtonText}>Logg ut</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

// Main Screen
export default function ProfileScreen({ navigation, route }) {
  const { user, loading, isAuthenticated, login, logout, updateProfile, syncProgress, uploadAvatar } = useAuth();
  const { stats: activityStats, completedActivities } = useActivityStats();
  const { entries, moments, getStats: getMasteryStats } = useMasteryLog();
  const { expeditions, environmentActions, getStats: getTrackingStats } = useActivityTracking();
  const { completedSkills, getStats: getSkillsStats, getTotalXPEarned } = useSkills();
  const { addContact } = useContacts();
  const [syncing, setSyncing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Check if we should open scanner directly (from Flokken)
  useEffect(() => {
    if (route?.params?.openScanner && isAuthenticated) {
      setShowQRModal(true);
      // Clear the param so it doesn't reopen on next focus
      navigation.setParams({ openScanner: false });
    }
  }, [route?.params?.openScanner, isAuthenticated]);

  const handleQRScanSuccess = async (contactData) => {
    const result = await addContact(contactData);
    if (result.success) {
      Alert.alert(
        result.isUpdate ? 'Kontakt oppdatert!' : 'Kontakt lagt til!',
        `${contactData.name || 'Medvandrer'} er nå i din Flokken-liste.`,
        [{ text: 'Se Flokken', onPress: () => navigation.navigate('Flokken') }, { text: 'OK' }]
      );
    }
  };

  // Get stats from hooks
  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();

  // Create combined stats for gamification (same as MyJourneyScreen)
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

  // Use gamification hook to get level and XP
  const { level, totalXP, loading: gamificationLoading } = useGamification(combinedStats);

  // Calculate local stats for display
  const localStats = {
    totalPoints: totalXP || 0,
    completedActivities: (activityStats?.totalCompletedActivities || 0) + (skillsStats?.completedSkills || 0),
    completedExpeditions: trackingStats?.totalExpeditions || 0,
    level: level || 1,
  };

  // Auto-sync when screen comes into focus (if logged in)
  const autoSync = useCallback(async () => {
    if (!isAuthenticated || syncing || gamificationLoading) return;
    
    // Only sync if there's data to sync
    if (localStats.totalPoints === 0 && localStats.completedActivities === 0) return;
    
    // Check if local data is newer/higher than server data
    const hasNewData = 
      localStats.totalPoints > (user?.totalPoints || 0) ||
      localStats.completedActivities > (user?.completedActivities || 0) ||
      localStats.completedExpeditions > (user?.completedExpeditions || 0);
    
    if (!hasNewData) return;
    
    setSyncing(true);
    try {
      const progress = {
        totalPoints: localStats.totalPoints,
        completedActivities: localStats.completedActivities,
        completedExpeditions: localStats.completedExpeditions,
        skills: completedSkills || [],
        reflections: entries || [],
      };
      await syncProgress(progress);
      // Silent sync - no alert on auto-sync
    } catch (err) {
      console.log('Auto-sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, syncing, gamificationLoading, localStats, user, completedSkills, entries, syncProgress]);

  // Run auto-sync when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to let data load first
      const timer = setTimeout(() => {
        autoSync();
      }, 500);
      return () => clearTimeout(timer);
    }, [autoSync])
  );

  const handleLogin = async (phone) => {
    const result = await login(phone);
    if (result.success) {
      Alert.alert(
        result.isNew ? 'Velkommen!' : 'Innlogget',
        result.isNew
          ? 'Din profil er opprettet. Fyll inn navn og e-post for å fullføre.'
          : `Velkommen tilbake, ${result.user.name || 'vandrer'}!`
      );
    } else {
      Alert.alert('Feil', result.error);
    }
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Collect local progress using the same data as displayed
      const progress = {
        totalPoints: totalXP || 0,
        completedActivities: localStats.completedActivities,
        completedExpeditions: localStats.completedExpeditions,
        skills: completedSkills || [],
        reflections: entries || [],
      };

      const result = await syncProgress(progress);
      if (result.success) {
        Alert.alert('Synkronisert', 'Din fremgang er lagret i skyen!');
      } else {
        Alert.alert('Feil', result.error);
      }
    } catch (err) {
      Alert.alert('Feil', 'Kunne ikke synkronisere fremgang');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="hourglass-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

  const handleLoginComplete = (result) => {
    if (result.success) {
      // Login/registration completed
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isAuthenticated ? (
        <ProfileView
          user={user}
          localStats={localStats}
          onLogout={handleLogout}
          onSync={handleSync}
          onUpdateProfile={updateProfile}
          onUploadAvatar={uploadAvatar}
          onShowQRCode={() => setShowQRModal(true)}
          onMembershipPress={() => navigation.navigate('Membership')}
          syncing={syncing}
          completedSkillIds={completedSkills}
        />
      ) : (
        <LoginFlow onComplete={handleLoginComplete} loading={loading} />
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={user}
        onScanSuccess={handleQRScanSuccess}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  contentWrapperTablet: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  cardsRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardsRowTablet: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardWrapper: {
    // Phone: stacked cards with gap between
  },
  cardWrapperTablet: {
    flex: 1,
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

  // Login Styles
  loginContainer: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  loginButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  loginNote: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
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
    ...theme.shadows.medium,
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
  contactInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  contactLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  contactText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
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

  // Membership Card
  membershipCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  membershipTitle: {
    ...theme.typography.h3,
    color: theme.colors.white,
    flex: 1,
  },
  membershipBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipLabel: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.8,
  },
  membershipValue: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  membershipStatusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.textSecondary,
  },
  membershipStatusActive: {
    backgroundColor: theme.colors.success,
  },
  membershipStatusPending: {
    backgroundColor: theme.colors.warning,
  },
  membershipStatusText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  membershipTapHint: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: theme.spacing.sm,
  },
  membershipTapHintText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },

  // Unsynced Banner
  unsyncedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warning + '20',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  unsyncedText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    fontWeight: '600',
  },

  // Førerkort Styles
  forerkortContainer: {
    // Container for the førerkort card
  },
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
  forerkortQRHint: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.md,
  },
  forerkortTapHint: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  forerkortTapHintText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
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

  // Profile Styles
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    flex: 1,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  profileInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: theme.spacing.sm,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  avatarHint: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    width: 70,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  editForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.backgroundElevated,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },

  // Skills & Badges
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  skillIcon: {
    marginRight: 2,
  },
  skillName: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '600',
  },
  skillLevel: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    opacity: 0.7,
    fontSize: 10,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: 80,
  },
  badgeName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },

  // Sync & Logout
  // QR Code Button
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  qrButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonContent: {
    flex: 1,
  },
  qrButtonTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  qrButtonSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  syncNote: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
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
  bottomSpacer: {
    height: theme.spacing.xxxl,
  },
});

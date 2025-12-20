import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';
import { useGamification } from '../hooks/useGamification';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useSkills } from '../hooks/useSkills';

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
function Forerkort({ user, localStats }) {
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
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.forerkort}
      >
        {/* Header */}
        <View style={styles.forerkortHeader}>
          <View style={styles.forerkortLogo}>
            <Icon name="trail-sign" size={24} color={theme.colors.white} />
          </View>
          <View>
            <Text style={styles.forerkortTitle}>MEDVANDRERNE</Text>
            <Text style={styles.forerkortSubtitle}>Vandrerbevis</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.forerkortContent}>
          <View style={styles.forerkortAvatar}>
            <Text style={styles.forerkortAvatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </Text>
          </View>
          <View style={styles.forerkortInfo}>
            <Text style={styles.forerkortName}>{user.name || 'Vandrer'}</Text>
            <View style={styles.forerkortLevel}>
              <Icon name="shield-checkmark" size={16} color={theme.colors.white} />
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

        {/* Holographic Effect */}
        <View style={styles.holographicOverlay} />
      </LinearGradient>
    </Animated.View>
  );
}

// Login Form Component
function LoginForm({ onLogin, loading }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    if (phone.trim().length < 8) {
      Alert.alert('Ugyldig nummer', 'Vennligst oppgi et gyldig telefonnummer');
      return;
    }
    onLogin(phone.trim());
  };

  return (
    <View style={styles.loginContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.loginHeader}
      >
        <Icon name="person-circle" size={80} color={theme.colors.white} />
        <Text style={styles.loginTitle}>Min Profil</Text>
        <Text style={styles.loginSubtitle}>
          Logg inn med telefonnummer for å lagre din fremgang
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
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButtonGradient}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>Logger inn...</Text>
            ) : (
              <>
                <Icon name="log-in" size={20} color={theme.colors.white} />
                <Text style={styles.loginButtonText}>Logg inn</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.loginNote}>
          Vi sender ingen SMS foreløpig - bare skriv inn nummeret ditt for å opprette eller logge inn på profilen din.
        </Text>
      </View>
    </View>
  );
}

// Profile View Component
function ProfileView({ user, localStats, onLogout, onSync, onUpdateProfile, syncing }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Førerkort */}
      <View style={styles.section}>
        <Forerkort user={user} localStats={localStats} />
        {hasUnsyncedProgress && (
          <View style={styles.unsyncedBanner}>
            <Icon name="cloud-upload-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.unsyncedText}>Du har usynkronisert fremgang</Text>
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
      {user.skills && user.skills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="ribbon" size={24} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Ferdigheter</Text>
          </View>
          <View style={styles.skillsGrid}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillLevel}>Nivå {skill.level}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="medal" size={24} color={theme.colors.success} />
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
    </ScrollView>
  );
}

// Main Screen
export default function ProfileScreen({ navigation }) {
  const { user, loading, isAuthenticated, login, logout, updateProfile, syncProgress } = useAuth();
  const { stats: activityStats, completedActivities } = useActivityStats();
  const { entries, moments, getStats: getMasteryStats } = useMasteryLog();
  const { expeditions, environmentActions, getStats: getTrackingStats } = useActivityTracking();
  const { completedSkills, getStats: getSkillsStats, getTotalXPEarned } = useSkills();
  const [syncing, setSyncing] = useState(false);

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
        <Icon name="hourglass" size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

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
          syncing={syncing}
        />
      ) : (
        <LoginForm onLogin={handleLogin} loading={loading} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginHorizontal: theme.spacing.lg,
  },
  unsyncedText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    fontWeight: '600',
  },

  // Førerkort Styles
  forerkortContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
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

  // Profile Styles
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  skillName: {
    ...theme.typography.caption,
    color: theme.colors.primary,
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

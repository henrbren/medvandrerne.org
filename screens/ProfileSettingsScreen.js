import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useActivityStats } from '../hooks/useActivityStats';
import { useMasteryLog } from '../hooks/useMasteryLog';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useSkills, SKILLS } from '../hooks/useSkills';
import { useGamification } from '../hooks/useGamification';

export default function ProfileSettingsScreen({ navigation }) {
  const { user, logout, syncProgress, refreshUserData } = useAuth();
  const { stats: activityStats } = useActivityStats();
  const { entries, getStats: getMasteryStats } = useMasteryLog();
  const { getStats: getTrackingStats } = useActivityTracking();
  const { completedSkills, getStats: getSkillsStats, getTotalXPEarned } = useSkills();
  
  const [syncing, setSyncing] = useState(false);

  // Get stats from hooks
  const masteryStats = getMasteryStats();
  const trackingStats = getTrackingStats();
  const skillsStats = getSkillsStats();
  const skillsXP = getTotalXPEarned();

  // Create combined stats for gamification
  const combinedStats = {
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
  };

  const { level, totalXP } = useGamification(combinedStats);

  // Calculate local stats
  const localStats = {
    totalPoints: totalXP || 0,
    completedActivities: (activityStats?.totalCompletedActivities || 0) + (skillsStats?.completedSkills || 0),
    completedExpeditions: trackingStats?.totalExpeditions || 0,
    level: level || 1,
  };

  // Check if local data is newer
  const hasUnsyncedProgress = 
    localStats.totalPoints > (user?.totalPoints || 0) ||
    localStats.completedActivities > (user?.completedActivities || 0);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const skillsWithDetails = (completedSkills || []).map(skillId => {
        const skill = SKILLS.find(s => s.id === skillId);
        return skill ? { id: skill.id, name: skill.name, level: 1 } : null;
      }).filter(Boolean);
      
      const progress = {
        totalPoints: localStats.totalPoints,
        completedActivities: localStats.completedActivities,
        completedExpeditions: localStats.completedExpeditions,
        skills: skillsWithDetails,
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

  const handleRefresh = async () => {
    setSyncing(true);
    await refreshUserData();
    setSyncing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logg ut', 'Er du sikker på at du vil logge ut?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logg ut',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synkronisering</Text>
        
        <View style={styles.card}>
          {/* Sync Status */}
          <View style={styles.syncStatus}>
            <View style={styles.syncStatusIcon}>
              <Icon 
                name={hasUnsyncedProgress ? "cloud-upload-outline" : "checkmark-circle"} 
                size={24} 
                color={hasUnsyncedProgress ? theme.colors.warning : theme.colors.success} 
              />
            </View>
            <View style={styles.syncStatusContent}>
              <Text style={styles.syncStatusTitle}>
                {hasUnsyncedProgress ? 'Usynkronisert fremgang' : 'Alt er synkronisert'}
              </Text>
              <Text style={styles.syncStatusText}>
                {hasUnsyncedProgress 
                  ? 'Du har fremgang som ikke er lagret i skyen'
                  : 'Din fremgang er oppdatert'}
              </Text>
            </View>
          </View>

          {/* Sync Button */}
          <TouchableOpacity
            style={[
              styles.syncButton, 
              hasUnsyncedProgress && styles.syncButtonPrimary,
              syncing && styles.syncButtonDisabled
            ]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={hasUnsyncedProgress ? theme.colors.white : theme.colors.primary} />
            ) : (
              <>
                <Icon 
                  name="cloud-upload-outline" 
                  size={18} 
                  color={hasUnsyncedProgress ? theme.colors.white : theme.colors.primary} 
                />
                <Text style={[
                  styles.syncButtonText,
                  hasUnsyncedProgress && styles.syncButtonTextPrimary
                ]}>
                  {hasUnsyncedProgress ? 'Synkroniser nå' : 'Synkroniser på nytt'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Refresh from server */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={syncing}
          >
            <Icon name="refresh-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.refreshButtonText}>Hent data fra server</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lokal statistikk</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{localStats.totalPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{localStats.completedActivities}</Text>
            <Text style={styles.statLabel}>Aktiviteter</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{localStats.completedExpeditions}</Text>
            <Text style={styles.statLabel}>Ekspedisjoner</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{localStats.level}</Text>
            <Text style={styles.statLabel}>Nivå</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={theme.colors.error} />
          <Text style={styles.logoutButtonText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      {/* User ID */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bruker-ID: {user?.id?.slice(-8).toUpperCase()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  syncStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  syncStatusContent: {
    flex: 1,
  },
  syncStatusTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  syncStatusText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  syncButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  syncButtonTextPrimary: {
    color: theme.colors.white,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  refreshButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontFamily: 'monospace',
  },
});



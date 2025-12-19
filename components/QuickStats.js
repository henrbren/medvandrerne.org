import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from './Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function QuickStats({ 
  masteryStats, 
  activityStats, 
  trackingStats, 
  skillsStats, 
  navigation 
}) {
  return (
    <View style={styles.quickStatsSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickStatsScroll}
        nestedScrollEnabled={true}
      >
        <TouchableOpacity
          style={styles.quickStatCardCompact}
          onPress={() => navigation.navigate('MasteryLog')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.info + '20' }]}>
            <Icon name="book" size={18} color={theme.colors.info} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{masteryStats.totalEntries}</Text>
            <Text style={styles.quickStatLabelCompact}>Refleksjoner</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickStatCardCompact}
          onPress={() => navigation.navigate('MasteryLog')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.warning + '20' }]}>
            <Icon name="trophy" size={18} color={theme.colors.warning} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{masteryStats.totalMoments}</Text>
            <Text style={styles.quickStatLabelCompact}>Mestringsmomenter</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.quickStatCardCompact}>
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.success + '20' }]}>
            <Icon name="flame" size={18} color={theme.colors.success} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{Math.floor((activityStats.currentStreak || 0) / 7)}</Text>
            <Text style={styles.quickStatLabelCompact}>Uker på rad</Text>
          </View>
        </View>

        <View style={styles.quickStatCardCompact}>
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="calendar" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{activityStats.totalActivities}</Text>
            <Text style={styles.quickStatLabelCompact}>Aktiviteter</Text>
          </View>
        </View>

        <View style={styles.quickStatCardCompact}>
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.info + '20' }]}>
            <Icon name="map" size={18} color={theme.colors.info} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{trackingStats.totalExpeditions}</Text>
            <Text style={styles.quickStatLabelCompact}>Ekspedisjoner</Text>
          </View>
        </View>

        <View style={styles.quickStatCardCompact}>
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.success + '20' }]}>
            <Icon name="leaf" size={18} color={theme.colors.success} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{trackingStats.totalEnvironmentActions}</Text>
            <Text style={styles.quickStatLabelCompact}>Miljøaksjoner</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.quickStatCardCompact}
          onPress={() => navigation.navigate('Skills')}
          activeOpacity={0.7}
        >
          <View style={[styles.quickStatIconCompact, { backgroundColor: theme.colors.warning + '20' }]}>
            <Icon name="star" size={18} color={theme.colors.warning} />
          </View>
          <View style={styles.quickStatContentCompact}>
            <Text style={styles.quickStatNumberCompact}>{skillsStats.completedSkills}</Text>
            <Text style={styles.quickStatLabelCompact}>Ferdigheter</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  quickStatsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  quickStatsScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  quickStatCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    minWidth: 140,
    ...theme.shadows.small,
  },
  quickStatIconCompact: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatContentCompact: {
    flex: 1,
  },
  quickStatNumberCompact: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 24,
  },
  quickStatLabelCompact: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});


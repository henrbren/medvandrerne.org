import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from './Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function MilestonesList({ 
  milestones, 
  onMilestonePress, 
  navigation 
}) {
  if (milestones.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
        <Icon name="flag-outline" size={24} color={theme.colors.info} />
        <Text style={styles.sectionTitle}>Neste milepæler</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('Se alle milepæler pressed');
            navigation.navigate('Milestones');
          }}
          activeOpacity={0.7}
          style={styles.seeAllButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.seeAllButtonContent}>
            <Text style={styles.seeAllLink}>Se alle</Text>
            <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.milestonesList}>
        {milestones.map((milestone) => {
          const progress = milestone.progress || 0;
          const currentValue = milestone.currentValue || 0;
          const threshold = milestone.threshold || 1;
          
          return (
            <TouchableOpacity
              key={milestone.id}
              style={styles.milestoneCard}
              onPress={() => {
                console.log('Milestone card pressed:', milestone.id);
                onMilestonePress(milestone);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.milestoneIcon}>
                <Icon
                  name={milestone.icon}
                  size={24}
                  color={
                    progress > 0.5
                      ? theme.colors.success
                      : theme.colors.textTertiary
                  }
                />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <View style={styles.milestoneProgressBar}>
                  <View
                    style={[
                      styles.milestoneProgressFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor:
                          progress > 0.5
                            ? theme.colors.success
                            : theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.milestoneProgressText}>
                  {currentValue} / {threshold}
                </Text>
              </View>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  seeAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    zIndex: 10,
    elevation: 10,
    minHeight: 32,
    justifyContent: 'center',
  },
  seeAllButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  seeAllLink: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  milestonesList: {
    gap: theme.spacing.sm,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
    zIndex: 1,
    elevation: 2,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  milestoneProgressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs / 2,
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  milestoneProgressText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});


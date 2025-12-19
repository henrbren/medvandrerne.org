import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function AchievementsList({ 
  achievements, 
  onAchievementPress, 
  navigation 
}) {
  if (achievements.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
        <Icon name="trophy" size={24} color={theme.colors.warning} />
        <Text style={styles.sectionTitle}>Prestasjoner</Text>
        <Text style={styles.achievementCount}>{achievements.length}</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('Se alle prestasjoner pressed');
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
      <View style={styles.achievementsContainer}>
        <LinearGradient
          colors={[theme.colors.background, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.achievementsFadeLeft}
          pointerEvents="none"
        />
        <View style={styles.achievementsListWrapper}>
          <FlatList
            data={achievements.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.achievementsScroll}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyExtractor={(item) => item.id}
            renderItem={({ item: achievement }) => (
              <TouchableOpacity
                style={styles.achievementBadge}
                onPress={() => {
                  console.log('Achievement badge pressed:', achievement.id);
                  onAchievementPress(achievement);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <LinearGradient
                  colors={[theme.colors.warning, '#FFD60A']}
                  style={styles.achievementGradient}
                >
                  <Icon name={achievement.icon} size={32} color={theme.colors.white} />
                </LinearGradient>
                <Text style={styles.achievementTitle} numberOfLines={2}>
                  {achievement.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <LinearGradient
          colors={['transparent', theme.colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.achievementsFadeRight}
          pointerEvents="none"
        />
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
  achievementCount: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.warning,
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
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
  achievementsContainer: {
    minHeight: 120,
    zIndex: 1,
    elevation: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsListWrapper: {
    flex: 1,
    marginHorizontal: 0,
  },
  achievementsFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 20,
  },
  achievementsFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 20,
  },
  achievementsScroll: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 100,
    zIndex: 100,
    elevation: 100,
    justifyContent: 'center',
  },
  achievementGradient: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.small,
  },
  achievementTitle: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});


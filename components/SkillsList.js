import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';

const isWeb = Platform.OS === 'web';

export default function SkillsList({ 
  skills, 
  completedSkills, 
  navigation, 
  onAddPress 
}) {
  return (
    <>
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { zIndex: 1001, position: 'relative' }]}>
          <Icon name="star-outline" size={24} color={theme.colors.warning} />
          <Text style={styles.sectionTitle}>Ferdigheter</Text>
          <Text style={styles.achievementCount}>{completedSkills.length}</Text>
          <TouchableOpacity
            onPress={() => {
              console.log('Se alle ferdigheter pressed');
              navigation.navigate('Skills');
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
      </View>
      
      <View style={styles.section}>
        <Pressable
          onPress={() => {
            console.log('Skill button pressed');
            onAddPress();
          }}
          style={({ pressed }) => [
            styles.quickAddButtonWrapper,
            pressed && { opacity: 0.8 }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.warning, '#FFD60A']}
            style={styles.quickAddGradient}
          >
            <Icon name="star" size={24} color={theme.colors.white} />
            <Text style={styles.quickAddText}>Legg til ferdighet</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </>
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
  quickAddButtonWrapper: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  quickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    minHeight: 50,
  },
  quickAddText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
});


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';
import { formatDate } from '../utils/journeyUtils';

const isWeb = Platform.OS === 'web';

export default function MomentsList({ 
  moments, 
  navigation, 
  onAddPress 
}) {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="trophy-outline" size={24} color={theme.colors.warning} />
          <Text style={styles.sectionTitle}>Mestringsmomenter</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Pressable
          onPress={() => {
            console.log('Moment button pressed');
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
            <Icon name="trophy" size={24} color={theme.colors.white} />
            <Text style={styles.quickAddText}>Legg til mestringsmoment</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.section}>
        {moments.length > 0 ? (
          <View style={styles.momentsList}>
            {moments.slice(0, 3).map((moment) => (
              <TouchableOpacity
                key={moment.id}
                style={styles.momentCard}
                onPress={() => {
                  try {
                    if (navigation && navigation.navigate) {
                      navigation.navigate('MasteryLog');
                    }
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.momentCategoryIcon,
                  { backgroundColor: 
                    moment.category === 'physical' ? theme.colors.success + '20' :
                    moment.category === 'social' ? theme.colors.info + '20' :
                    theme.colors.warning + '20'
                  }
                ]}>
                  <Icon
                    name={
                      moment.category === 'physical' ? 'fitness-outline' :
                      moment.category === 'social' ? 'people-outline' :
                      'heart-outline'
                    }
                    size={20}
                    color={
                      moment.category === 'physical' ? theme.colors.success :
                      moment.category === 'social' ? theme.colors.info :
                      theme.colors.warning
                    }
                  />
                </View>
                <View style={styles.momentContent}>
                  <Text style={styles.momentTitle}>{moment.title}</Text>
                  <Text style={styles.momentDate}>{formatDate(moment.date)}</Text>
                </View>
                <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReflections}>
            <Icon name="trophy-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyReflectionsText}>
              Ingen mestringsmomenter ennå. Feir dine prestasjoner!
            </Text>
          </View>
        )}
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
  momentsList: {
    gap: theme.spacing.sm,
  },
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  momentCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentContent: {
    flex: 1,
  },
  momentTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  momentDate: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  emptyReflections: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyReflectionsText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});


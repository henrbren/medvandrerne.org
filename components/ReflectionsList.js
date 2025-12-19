import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';
import { formatDate } from '../utils/journeyUtils';

const isWeb = Platform.OS === 'web';

export default function ReflectionsList({ 
  entries, 
  navigation, 
  onAddPress 
}) {
  return (
    <>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
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
          <Icon name="book-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Refleksjoner</Text>
          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Pressable
          onPress={() => {
            console.log('Reflection button pressed');
            onAddPress();
          }}
          style={({ pressed }) => [
            styles.quickAddButtonWrapper,
            pressed && { opacity: 0.8 }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.quickAddGradient}
          >
            <Icon name="add-circle" size={24} color={theme.colors.white} />
            <Text style={styles.quickAddText}>Legg til refleksjon</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.section}>
        {entries.length > 0 ? (
          <View style={styles.reflectionsList}>
            {entries.slice(0, 3).map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.reflectionCard}
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
                <View style={styles.reflectionHeader}>
                  <Text style={styles.reflectionDate}>{formatDate(entry.date)}</Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </View>
                {entry.reflection && (
                  <Text style={styles.reflectionText} numberOfLines={2}>
                    {entry.reflection}
                  </Text>
                )}
                {entry.gratitude && (
                  <View style={styles.gratitudeBadge}>
                    <Icon name="heart" size={12} color={theme.colors.success} />
                    <Text style={styles.gratitudeText}>Takk</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReflections}>
            <Icon name="book-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyReflectionsText}>
              Ingen refleksjoner ennå. Start din reise!
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
  reflectionsList: {
    gap: theme.spacing.sm,
  },
  reflectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  reflectionDate: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  reflectionText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  gratitudeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  gratitudeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
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


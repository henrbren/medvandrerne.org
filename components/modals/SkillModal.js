import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { SKILLS } from '../../hooks/useSkills';

export default function SkillModal({ 
  visible, 
  completedSkills, 
  onToggleSkill, 
  onClose 
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Legg til ferdighet</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.skillsGrid}>
                {SKILLS.map((skill) => {
                  const isCompleted = completedSkills.includes(skill.id);
                  return (
                    <TouchableOpacity
                      key={skill.id}
                      style={[
                        styles.skillSelectCard,
                        isCompleted && styles.skillSelectCardCompleted,
                      ]}
                      onPress={() => onToggleSkill(skill.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.skillSelectIcon,
                        { backgroundColor: isCompleted ? theme.colors.warning + '20' : theme.colors.surfaceElevated }
                      ]}>
                        <Icon
                          name={skill.icon}
                          size={24}
                          color={isCompleted ? theme.colors.warning : theme.colors.textSecondary}
                        />
                        {isCompleted && (
                          <View style={styles.skillCheckBadge}>
                            <Icon name="checkmark" size={16} color={theme.colors.white} />
                          </View>
                        )}
                      </View>
                      <View style={styles.skillSelectContent}>
                        <Text style={[
                          styles.skillSelectTitle,
                          isCompleted && { color: theme.colors.warning }
                        ]}>
                          {skill.name}
                        </Text>
                        <Text style={styles.skillSelectDescription} numberOfLines={2}>
                          {skill.description}
                        </Text>
                        <View style={styles.skillSelectXP}>
                          <Icon name="star" size={12} color={theme.colors.warning} />
                          <Text style={styles.skillSelectXPText}>+{skill.xpReward} XP</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Lukk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
    maxHeight: 400,
  },
  skillsGrid: {
    gap: theme.spacing.md,
  },
  skillSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  skillSelectCardCompleted: {
    borderWidth: 2,
    borderColor: theme.colors.warning + '40',
  },
  skillSelectIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skillCheckBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  skillSelectContent: {
    flex: 1,
  },
  skillSelectTitle: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  skillSelectDescription: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  skillSelectXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillSelectXPText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  modalCancelText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});


import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { getAchievementMotivation } from '../../utils/journeyUtils';

export default function MilestoneModal({ 
  visible, 
  milestone, 
  onClose 
}) {
  if (!milestone) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContentWrapper}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.achievementModalHeader}>
                  <LinearGradient
                    colors={[theme.colors.info, '#22D3EE']}
                    style={styles.achievementModalIcon}
                  >
                    <Icon 
                      name={milestone.icon || 'flag'} 
                      size={32} 
                      color={theme.colors.white} 
                    />
                  </LinearGradient>
                  <View style={styles.achievementModalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {milestone.title || 'Milepæl'}
                    </Text>
                    <Text style={styles.achievementModalDescription}>
                      {milestone.description || ''}
                    </Text>
                    <Text style={styles.milestoneProgressText}>
                      {milestone.currentValue || 0} / {milestone.threshold || 1}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.achievementMotivationContainer}>
                  <Text style={styles.achievementMotivationText}>
                    {getAchievementMotivation(milestone.id)}
                  </Text>
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
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  achievementModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  achievementModalIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  achievementModalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  achievementModalDescription: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  milestoneProgressText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
  },
  modalBody: {
    maxHeight: 300,
  },
  modalBodyContent: {
    padding: theme.spacing.lg,
  },
  achievementMotivationContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  achievementMotivationText: {
    ...theme.typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
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


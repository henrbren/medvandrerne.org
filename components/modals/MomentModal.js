import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../Icon';
import { theme } from '../../constants/theme';

export default function MomentModal({ 
  visible, 
  momentTitle, 
  momentCategory, 
  onTitleChange, 
  onCategoryChange, 
  onSave, 
  onClose 
}) {
  const categories = [
    { key: 'physical', label: 'Fysisk', icon: 'fitness-outline', color: theme.colors.success },
    { key: 'social', label: 'Sosial', icon: 'people-outline', color: theme.colors.info },
    { key: 'emotional', label: 'Emosjonell', icon: 'heart-outline', color: theme.colors.warning },
  ];

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
              <Text style={styles.modalTitle}>Nytt mestringsmoment</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Beskriv ditt mestringsmoment</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="F.eks. Gikk en lang tur i dag"
                  value={momentTitle}
                  onChangeText={onTitleChange}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Kategori</Text>
                <View style={styles.categoryButtons}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryButton,
                        momentCategory === cat.key && styles.categoryButtonActive,
                        { borderColor: cat.color + '40' },
                        momentCategory === cat.key && { backgroundColor: cat.color + '20' },
                      ]}
                      onPress={() => onCategoryChange(cat.key)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={cat.icon}
                        size={20}
                        color={momentCategory === cat.key ? cat.color : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.categoryButtonText,
                          momentCategory === cat.key && { color: cat.color },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  !momentTitle.trim() && styles.modalSaveButtonDisabled
                ]}
                onPress={onSave}
                activeOpacity={0.7}
                disabled={!momentTitle.trim()}
              >
                <LinearGradient
                  colors={[theme.colors.warning, '#FFD60A']}
                  style={styles.modalSaveGradient}
                >
                  <Text style={styles.modalSaveText}>Lagre</Text>
                </LinearGradient>
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
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    backgroundColor: theme.colors.surface,
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
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
  modalSaveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
});


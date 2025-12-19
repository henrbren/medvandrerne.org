import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Alert,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useActivityTracking } from '../hooks/useActivityTracking';

const isWeb = Platform.OS === 'web';

const ACTION_TYPES = [
  { id: 'cleanup', name: 'Opprydding', icon: 'trash', color: theme.colors.success },
  { id: 'planting', name: 'Planting', icon: 'leaf', color: theme.colors.success },
  { id: 'conservation', name: 'Bevaring', icon: 'shield', color: theme.colors.info },
  { id: 'education', name: 'Opplysning', icon: 'school', color: theme.colors.primary },
  { id: 'other', name: 'Annet', icon: 'ellipse', color: theme.colors.textSecondary },
];

export default function EnvironmentActionsScreen({ navigation }) {
  const { environmentActions, loading, addEnvironmentAction, deleteEnvironmentAction, getStats, loadData } = useActivityTracking();
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('cleanup');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // FAB animations
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      useNativeDriver: true,
    }).start();
    
    // FAB pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    // FAB rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(fabRotation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();
  }, []);

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    
    setShowModal(true);
  };
  
  const rotateInterpolate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const stats = getStats();

  const handleAddAction = async () => {
    if (title.trim()) {
      await addEnvironmentAction({
        title: title.trim(),
        type: actionType,
        description: description.trim(),
        impact: impact.trim(),
      });
      setTitle('');
      setActionType('cleanup');
      setDescription('');
      setImpact('');
      setShowModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionTypeInfo = (typeId) => {
    return ACTION_TYPES.find(t => t.id === typeId) || ACTION_TYPES[ACTION_TYPES.length - 1];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laster...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb,
        ]}
      >
        {/* Stats Header */}
        <Animated.View style={[styles.statsHeader, { opacity: fadeAnim }]}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalEnvironmentActions}</Text>
              <Text style={styles.statLabel}>Totalt</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.thisYearEnvActions}</Text>
              <Text style={styles.statLabel}>I år</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="leaf" size={32} color={theme.colors.success} />
              <Text style={styles.statLabel}>Miljøaksjoner</Text>
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.contentSection}>
          {environmentActions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="leaf-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>Ingen miljøaksjoner ennå</Text>
              <Text style={styles.emptyStateText}>
                Dokumenter dine bidrag til miljøet og naturen
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.success, theme.colors.success + 'CC']}
                  style={styles.addButtonGradient}
                >
                  <Icon name="add" size={24} color={theme.colors.white} />
                  <Text style={styles.addButtonText}>Legg til miljøaksjon</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionsList}>
              {[...environmentActions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((action) => {
                const typeInfo = getActionTypeInfo(action.type || 'other');
                return (
                  <View key={action.id} style={styles.actionCard}>
                    <View style={styles.actionHeader}>
                      <View style={styles.actionHeaderLeft}>
                        <View style={[styles.actionTypeIcon, { backgroundColor: typeInfo.color + '20' }]}>
                          <Icon name={typeInfo.icon} size={24} color={typeInfo.color} />
                        </View>
                        <View style={styles.actionHeaderText}>
                          <Text style={styles.actionTitle}>{action.title || 'Miljøaksjon'}</Text>
                          <View style={styles.actionTypeBadge}>
                            <Text style={[styles.actionTypeText, { color: typeInfo.color }]}>
                              {typeInfo.name}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Slett miljøaksjon',
                            'Er du sikker på at du vil slette denne miljøaksjonen?',
                            [
                              { text: 'Avbryt', style: 'cancel' },
                              {
                                text: 'Slett',
                                style: 'destructive',
                                onPress: () => deleteEnvironmentAction(action.id),
                              },
                            ]
                          );
                        }}
                        style={styles.deleteButton}
                      >
                        <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.actionMeta}>
                      <Text style={styles.actionDate}>{formatDate(action.date)}</Text>
                      <Text style={styles.actionTime}>{formatTime(action.date)}</Text>
                    </View>

                    {action.description && (
                      <View style={styles.actionDescription}>
                        <Text style={styles.actionDescriptionText}>{action.description}</Text>
                      </View>
                    )}

                    {action.impact && (
                      <View style={styles.actionImpact}>
                        <View style={styles.actionImpactHeader}>
                          <Icon name="leaf" size={16} color={theme.colors.success} />
                          <Text style={styles.actionImpactTitle}>Påvirkning</Text>
                        </View>
                        <Text style={styles.actionImpactText}>{action.impact}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      {environmentActions.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.fabContainer,
              {
                transform: [
                  { scale: fabScale },
                  { scale: fabPulse },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.success, theme.colors.success + 'CC']}
              style={styles.fabGradient}
            >
              <Icon name="add" size={28} color={theme.colors.white} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Add Action Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Legg til miljøaksjon</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tittel *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. Opprydding ved sjøen"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  multiline={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {ACTION_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        actionType === type.id && styles.typeOptionActive,
                        actionType === type.id && { borderColor: type.color },
                      ]}
                      onPress={() => setActionType(type.id)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={type.icon}
                        size={20}
                        color={actionType === type.id ? type.color : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          actionType === type.id && { color: type.color },
                        ]}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Beskrivelse</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beskriv hva du gjorde..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Påvirkning</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beskriv hvilken påvirkning dette hadde..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={impact}
                  onChangeText={setImpact}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, !title.trim() && styles.modalSaveButtonDisabled]}
                onPress={handleAddAction}
                activeOpacity={0.7}
                disabled={!title.trim()}
              >
                <LinearGradient
                  colors={[theme.colors.success, theme.colors.success + 'CC']}
                  style={styles.modalSaveGradient}
                >
                  <Text style={styles.modalSaveText}>Lagre</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWeb: {
    maxWidth: theme.web.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.web.sidePadding,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsHeader: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statNumber: {
    ...theme.typography.h2,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs / 2,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  contentSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  addButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  actionsList: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  actionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
  },
  actionTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHeaderText: {
    flex: 1,
  },
  actionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  actionTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionTypeText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  actionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  actionDate: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  actionTime: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  actionDescription: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionDescriptionText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionImpact: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success + '10',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  actionImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  actionImpactTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
  actionImpactText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 1000,
  },
  fabContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...theme.shadows.large,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
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
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputGroup: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  typeOptionText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
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
    fontWeight: '600',
    color: theme.colors.white,
  },
});


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

export default function ExpeditionsScreen({ navigation }) {
  const { expeditions, loading, addExpedition, deleteExpedition, getStats, loadData } = useActivityTracking();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
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

  const handleAddExpedition = async () => {
    if (title.trim()) {
      await addExpedition({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        duration: duration.trim(),
      });
      setTitle('');
      setLocation('');
      setDescription('');
      setDuration('');
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
              <Text style={styles.statNumber}>{stats.totalExpeditions}</Text>
              <Text style={styles.statLabel}>Totalt</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.thisYearExpeditions}</Text>
              <Text style={styles.statLabel}>I år</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="map" size={32} color={theme.colors.info} />
              <Text style={styles.statLabel}>Ekspedisjoner</Text>
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.contentSection}>
          {expeditions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="map-outline" size={64} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>Ingen ekspedisjoner ennå</Text>
              <Text style={styles.emptyStateText}>
                Dokumenter dine reiser og opplevelser i naturen
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.info, theme.colors.info + 'CC']}
                  style={styles.addButtonGradient}
                >
                  <Icon name="add" size={24} color={theme.colors.white} />
                  <Text style={styles.addButtonText}>Legg til ekspedisjon</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.expeditionsList}>
              {[...expeditions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((expedition) => (
                <View key={expedition.id} style={styles.expeditionCard}>
                  <View style={styles.expeditionHeader}>
                    <View style={styles.expeditionHeaderLeft}>
                      <Icon name="map" size={24} color={theme.colors.info} />
                      <View style={styles.expeditionHeaderText}>
                        <Text style={styles.expeditionTitle}>{expedition.title || 'Ekspedisjon'}</Text>
                        {expedition.location && (
                          <Text style={styles.expeditionLocation}>
                            <Icon name="location" size={14} color={theme.colors.textSecondary} /> {expedition.location}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Slett ekspedisjon',
                          'Er du sikker på at du vil slette denne ekspedisjonen?',
                          [
                            { text: 'Avbryt', style: 'cancel' },
                            {
                              text: 'Slett',
                              style: 'destructive',
                              onPress: () => deleteExpedition(expedition.id),
                            },
                          ]
                        );
                      }}
                      style={styles.deleteButton}
                    >
                      <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.expeditionMeta}>
                    <Text style={styles.expeditionDate}>{formatDate(expedition.date)}</Text>
                    <Text style={styles.expeditionTime}>{formatTime(expedition.date)}</Text>
                    {expedition.duration && (
                      <View style={styles.expeditionDuration}>
                        <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.expeditionDurationText}>{expedition.duration}</Text>
                      </View>
                    )}
                  </View>

                  {expedition.description && (
                    <View style={styles.expeditionDescription}>
                      <Text style={styles.expeditionDescriptionText}>{expedition.description}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      {expeditions.length > 0 && (
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
              colors={[theme.colors.info, theme.colors.info + 'CC']}
              style={styles.fabGradient}
            >
              <Icon name="add" size={28} color={theme.colors.white} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Add Expedition Modal */}
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
              <Text style={styles.modalTitle}>Legg til ekspedisjon</Text>
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
                  placeholder="F.eks. Fjelltur til Galdhøpiggen"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  multiline={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sted</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. Jotunheimen"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={location}
                  onChangeText={setLocation}
                  multiline={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Varighet</Text>
                <TextInput
                  style={styles.input}
                  placeholder="F.eks. 3 dager, 5 timer"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={duration}
                  onChangeText={setDuration}
                  multiline={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Beskrivelse</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beskriv opplevelsen, utfordringene, eller hva du lærte..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={6}
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
                onPress={handleAddExpedition}
                activeOpacity={0.7}
                disabled={!title.trim()}
              >
                <LinearGradient
                  colors={[theme.colors.info, theme.colors.info + 'CC']}
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
    color: theme.colors.info,
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
  expeditionsList: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  expeditionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  expeditionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  expeditionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
  },
  expeditionHeaderText: {
    flex: 1,
  },
  expeditionTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  expeditionLocation: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expeditionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  expeditionDate: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expeditionTime: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expeditionDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expeditionDurationText: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expeditionDescription: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  expeditionDescriptionText: {
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
    minHeight: 120,
    paddingTop: theme.spacing.md,
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


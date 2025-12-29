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
  Pressable,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useMasteryLog } from '../hooks/useMasteryLog';
import XPCelebration from '../components/XPCelebration';

const isWeb = Platform.OS === 'web';

export default function MasteryLogScreen({ navigation }) {
  const { entries, moments, loading, addEntry, addMoment, deleteEntry, deleteMoment, getStats } = useMasteryLog();
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'moments'
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showMomentModal, setShowMomentModal] = useState(false);
  const [reflection, setReflection] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [momentTitle, setMomentTitle] = useState('');
  const [momentCategory, setMomentCategory] = useState('physical');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationXP, setCelebrationXP] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // FAB animations
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: theme.animations.normal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    // FAB pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
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
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();
  }, []);
  
  const handleFabPress = () => {
    // Scale animation on press
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
    
    if (activeTab === 'log') {
      setShowEntryModal(true);
    } else {
      // For moments tab, open with default category
      openMomentModal('physical');
    }
  };
  
  const rotateInterpolate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const stats = getStats();

  const handleAddEntry = async () => {
    if (reflection.trim() || gratitude.trim()) {
      await addEntry({
        reflection: reflection.trim(),
        gratitude: gratitude.trim(),
        category: 'general',
      });
      setReflection('');
      setGratitude('');
      setShowEntryModal(false);
      // Show XP celebration for reflection (30 XP)
      setCelebrationXP(30);
      setShowCelebration(true);
    }
  };

  const handleAddMoment = async () => {
    if (momentTitle.trim()) {
      await addMoment({
        title: momentTitle.trim(),
        category: momentCategory,
        description: '',
      });
      setMomentTitle('');
      setShowMomentModal(false);
      // Show XP celebration for mastery moment (40 XP)
      setCelebrationXP(40);
      setShowCelebration(true);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setCelebrationXP(0);
  };

  const openMomentModal = (category) => {
    setMomentCategory(category);
    setShowMomentModal(true);
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
              <Text style={styles.statNumber}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Refleksjoner</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalMoments}</Text>
              <Text style={styles.statLabel}>Mestringsmomenter</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.thisWeekEntries}</Text>
              <Text style={styles.statLabel}>Denne uken</Text>
            </View>
          </View>
        </Animated.View>

        {/* Tabs */}
        <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'log' && styles.tabActive]}
            onPress={() => setActiveTab('log')}
            activeOpacity={0.7}
          >
            <Icon name="book-outline" size={20} color={activeTab === 'log' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'log' && styles.tabTextActive]}>
              Reisebok
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'moments' && styles.tabActive]}
            onPress={() => setActiveTab('moments')}
            activeOpacity={0.7}
          >
            <Icon name="trophy-outline" size={20} color={activeTab === 'moments' ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'moments' && styles.tabTextActive]}>
              Mestringsmomenter
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content */}
        {activeTab === 'log' ? (
          <View style={styles.contentSection}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="book-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>Ingen refleksjoner ennå</Text>
                <Text style={styles.emptyStateText}>
                  Start din reise ved å legge til din første refleksjon
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowEntryModal(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.addButtonGradient}
                  >
                    <Icon name="add" size={24} color={theme.colors.white} />
                    <Text style={styles.addButtonText}>Legg til refleksjon</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.entriesList}>
                  {[...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                    <View key={entry.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                        <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Slett refleksjon',
                              'Er du sikker på at du vil slette denne refleksjonen?',
                              [
                                { text: 'Avbryt', style: 'cancel' },
                                {
                                  text: 'Slett',
                                  style: 'destructive',
                                  onPress: () => deleteEntry(entry.id),
                                },
                              ]
                            );
                          }}
                          style={styles.deleteButton}
                        >
                          <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                      {entry.reflection && (
                        <View style={styles.entrySection}>
                          <View style={styles.entrySectionHeader}>
                            <Icon name="bulb-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.entrySectionTitle}>Hva lærte jeg?</Text>
                          </View>
                          <Text style={styles.entryText}>{entry.reflection}</Text>
                        </View>
                      )}
                      {entry.gratitude && (
                        <View style={styles.entrySection}>
                          <View style={styles.entrySectionHeader}>
                            <Icon name="heart-outline" size={16} color={theme.colors.success} />
                            <Text style={styles.entrySectionTitle}>Takk for</Text>
                          </View>
                          <Text style={styles.entryText}>{entry.gratitude}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
            )}
          </View>
        ) : (
          <View style={styles.contentSection}>
            {moments.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="trophy-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>Ingen mestringsmomenter ennå</Text>
                <Text style={styles.emptyStateText}>
                  Feire dine prestasjoner ved å legge til mestringsmomenter
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.momentsGrid}>
                  {[...moments].sort((a, b) => new Date(b.date) - new Date(a.date)).map((moment) => (
                    <View key={moment.id} style={styles.momentCard}>
                      <View style={styles.momentHeader}>
                        <View style={[
                          styles.momentCategoryBadge,
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
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Slett moment',
                              'Er du sikker på at du vil slette dette mestringsmomentet?',
                              [
                                { text: 'Avbryt', style: 'cancel' },
                                {
                                  text: 'Slett',
                                  style: 'destructive',
                                  onPress: () => deleteMoment(moment.id),
                                },
                              ]
                            );
                          }}
                        >
                          <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.momentTitle}>{moment.title}</Text>
                      <Text style={styles.momentDate}>{formatDate(moment.date)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.addMomentsButtons}>
                  <TouchableOpacity
                    style={styles.addMomentButton}
                    onPress={() => openMomentModal('physical')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.addMomentButtonIcon, { backgroundColor: theme.colors.success + '20' }]}>
                      <Icon name="fitness-outline" size={24} color={theme.colors.success} />
                    </View>
                    <Text style={styles.addMomentButtonText}>Fysisk mestring</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addMomentButton}
                    onPress={() => openMomentModal('social')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.addMomentButtonIcon, { backgroundColor: theme.colors.info + '20' }]}>
                      <Icon name="people-outline" size={24} color={theme.colors.info} />
                    </View>
                    <Text style={styles.addMomentButtonText}>Sosial mestring</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addMomentButton}
                    onPress={() => openMomentModal('emotional')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.addMomentButtonIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                      <Icon name="heart-outline" size={24} color={theme.colors.warning} />
                    </View>
                    <Text style={styles.addMomentButtonText}>Emosjonell mestring</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB - Floating over content */}
      {((activeTab === 'log' && entries.length > 0) || (activeTab === 'moments' && moments.length > 0)) && (
        <TouchableOpacity
          style={styles.fabContainer}
          onPress={handleFabPress}
          activeOpacity={0.9}
        >
          {/* Outer glow ring */}
          <Animated.View
            style={[
              styles.fabGlow,
              {
                transform: [{ scale: fabPulse }],
                opacity: fabPulse.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.3, 0.6],
                }),
                backgroundColor: activeTab === 'moments' ? theme.colors.warning : theme.colors.primary,
              },
            ]}
          />
          
          {/* Middle ring */}
          <Animated.View
            style={[
              styles.fabRing,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            <LinearGradient
              colors={
                activeTab === 'moments' 
                  ? [theme.colors.warning + '40', '#FFD60A' + '40', 'transparent']
                  : [theme.colors.primary + '40', theme.colors.primaryLight + '40', 'transparent']
              }
              style={styles.fabRingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          {/* Main button */}
          <Animated.View
            style={[
              styles.fab,
              {
                transform: [{ scale: fabScale }],
              },
            ]}
          >
            <LinearGradient
              colors={
                activeTab === 'moments'
                  ? [theme.colors.warning, '#FFD60A', '#FFB800']
                  : [theme.colors.primary, theme.colors.primaryLight, '#FF6B6B']
              }
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.fabIconContainer}>
                <Icon 
                  name={activeTab === 'moments' ? 'trophy' : 'heart'} 
                  size={32} 
                  color={theme.colors.white} 
                />
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Shine effect */}
          <View style={styles.fabShine} />
        </TouchableOpacity>
      )}

      {/* Entry Modal */}
      <Modal
        visible={showEntryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEntryModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowEntryModal(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Legg til refleksjon</Text>
                <TouchableOpacity onPress={() => setShowEntryModal(false)}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Icon name="bulb-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.inputLabel}>Hva lærte jeg i dag?</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Skriv din refleksjon her..."
                    value={reflection}
                    onChangeText={setReflection}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Icon name="heart-outline" size={20} color={theme.colors.success} />
                    <Text style={styles.inputLabel}>Hva er jeg takknemlig for?</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Skriv hva du er takknemlig for..."
                    value={gratitude}
                    onChangeText={setGratitude}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setReflection('');
                    setGratitude('');
                    setShowEntryModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleAddEntry}
                  disabled={!reflection.trim() && !gratitude.trim()}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Lagre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Moment Modal */}
      <Modal
        visible={showMomentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMomentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowMomentModal(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Legg til mestringsmoment</Text>
                <TouchableOpacity onPress={() => setShowMomentModal(false)}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Icon
                      name={
                        momentCategory === 'physical' ? 'fitness-outline' :
                        momentCategory === 'social' ? 'people-outline' :
                        'heart-outline'
                      }
                      size={20}
                      color={
                        momentCategory === 'physical' ? theme.colors.success :
                        momentCategory === 'social' ? theme.colors.info :
                        theme.colors.warning
                      }
                    />
                    <Text style={styles.inputLabel}>
                      {momentCategory === 'physical' ? 'Fysisk mestring' :
                       momentCategory === 'social' ? 'Sosial mestring' :
                       'Emosjonell mestring'}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={3}
                    placeholder="Beskriv mestringsmomentet..."
                    value={momentTitle}
                    onChangeText={setMomentTitle}
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setMomentTitle('');
                    setShowMomentModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleAddMoment}
                  disabled={!momentTitle.trim()}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={styles.modalSaveGradient}
                  >
                    <Text style={styles.modalSaveText}>Lagre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* XP Celebration */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleCelebrationComplete}
        pointerEvents={showCelebration ? 'auto' : 'none'}
      >
        <XPCelebration
          visible={showCelebration}
          xpAmount={celebrationXP}
          celebrationType="normal"
          onComplete={handleCelebrationComplete}
        />
      </Pressable>
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
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  statLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tabActive: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  contentSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    minHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
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
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  addButton: {
    borderRadius: theme.borderRadius.xl,
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
    ...theme.typography.button,
    color: theme.colors.white,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: isWeb ? theme.web.sidePadding : theme.spacing.lg,
    zIndex: 1000,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  fabRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
  },
  fabRingGradient: {
    width: '100%',
    height: '100%',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    ...theme.shadows.large,
    elevation: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fabShine: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.6,
  },
  entriesList: {
    gap: theme.spacing.md,
  },
  entryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  entryDate: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  entryTime: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginRight: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  entrySection: {
    marginBottom: theme.spacing.md,
  },
  entrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  entrySectionTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  entryText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  momentCard: {
    width: 'calc(50% - 8px)',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
    ...(isWeb && {
      width: 'calc(33.333% - 12px)',
    }),
  },
  momentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  momentCategoryBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentTitle: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  momentDate: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  addMomentsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  addMomentButton: {
    flex: 1,
    minWidth: 'calc(33.333% - 12px)',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  addMomentButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  addMomentButtonText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    marginBottom: theme.spacing.lg,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  textInput: {
    ...theme.typography.body,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  modalCancelText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
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


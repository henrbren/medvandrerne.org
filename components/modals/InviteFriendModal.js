import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { useContacts } from '../../hooks/useContacts';
import { useInvitations } from '../../hooks/useInvitations';
import { useAuth } from '../../contexts/AuthContext';
import { getLevelColors } from '../../utils/journeyUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Modal for inviting contacts from your "flokken" to an activity
 */
export default function InviteFriendModal({ visible, onClose, activity }) {
  const { contacts, loading: contactsLoading } = useContacts();
  const { sendInvitation, hasInvitedContactToActivity } = useInvitations();
  const { user, localStats } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState('select'); // 'select' or 'message'

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state when opening
      setSearchQuery('');
      setSelectedContact(null);
      setPersonalMessage('');
      setStep('select');
      
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (contact.name || '').toLowerCase().includes(query) ||
      (contact.levelName || '').toLowerCase().includes(query) ||
      (contact.groupName || '').toLowerCase().includes(query)
    );
  });

  // Check if contact has already been invited to this activity
  const isAlreadyInvited = useCallback((contactId) => {
    return hasInvitedContactToActivity(contactId, activity?.id);
  }, [hasInvitedContactToActivity, activity?.id]);

  // Handle selecting a contact
  const handleSelectContact = (contact) => {
    if (isAlreadyInvited(contact.id)) {
      Alert.alert(
        'Allerede invitert',
        `Du har allerede sendt en invitasjon til ${contact.name || 'denne personen'} for denne aktiviteten.`
      );
      return;
    }
    setSelectedContact(contact);
    setStep('message');
  };

  // Handle sending the invitation
  const handleSendInvitation = async () => {
    if (!selectedContact || !activity) return;

    setSending(true);
    try {
      const result = await sendInvitation({
        activityId: activity.id,
        activityTitle: activity.title,
        activityDate: activity.date,
        recipientId: selectedContact.userId || selectedContact.id,
        recipientName: selectedContact.name || 'Medvandrer',
        recipientPhone: selectedContact.phone || null,
        recipientEmail: selectedContact.email || null,
        senderName: user?.name || 'En Medvandrer',
        senderLevel: Math.max(user?.level || 1, localStats?.level || 1),
        message: personalMessage.trim() || null,
      });

      if (result.success) {
        Alert.alert(
          'Invitasjon sendt! 📬',
          `${selectedContact.name || 'Kontakten'} har mottatt invitasjonen din.`,
          [{ text: 'Flott!', onPress: onClose }]
        );
      } else {
        Alert.alert('Feil', result.error || 'Kunne ikke sende invitasjon. Prøv igjen.');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.');
    } finally {
      setSending(false);
    }
  };

  // Go back to contact selection
  const handleBack = () => {
    setStep('select');
    setSelectedContact(null);
    setPersonalMessage('');
  };

  // Render contact item
  const renderContactItem = (contact) => {
    const alreadyInvited = isAlreadyInvited(contact.id);
    const imageUrl = contact.avatarUrl || contact.image;
    const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http');
    const levelColors = getLevelColors(contact.level || 1);

    return (
      <TouchableOpacity
        key={contact.id}
        style={[styles.contactItem, alreadyInvited && styles.contactItemDisabled]}
        onPress={() => handleSelectContact(contact)}
        activeOpacity={alreadyInvited ? 1 : 0.7}
        disabled={alreadyInvited}
      >
        <View style={[styles.contactAvatar, { borderColor: levelColors.primary }]}>
          {hasValidImage ? (
            <Image source={{ uri: imageUrl }} style={styles.contactAvatarImage} />
          ) : (
            <View style={[styles.contactAvatarPlaceholder, { backgroundColor: levelColors.primary }]}>
              <Text style={styles.contactAvatarText}>
                {(contact.name || 'M').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, alreadyInvited && styles.textDisabled]}>
            {contact.name || 'Medvandrer'}
          </Text>
          <Text style={[styles.contactSubtitle, alreadyInvited && styles.textDisabled]}>
            Nivå {contact.level || 1}
            {contact.levelName ? ` · ${contact.levelName}` : ''}
          </Text>
        </View>
        {alreadyInvited ? (
          <View style={styles.invitedBadge}>
            <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.invitedText}>Invitert</Text>
          </View>
        ) : (
          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        )}
      </TouchableOpacity>
    );
  };

  if (!activity) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1} />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              {step === 'message' && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              )}
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  {step === 'select' ? 'Inviter fra Flokken' : 'Skriv melding'}
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {activity.title}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {step === 'select' ? (
              <>
                {/* Search bar */}
                <View style={styles.searchContainer}>
                  <Icon name="search" size={18} color={theme.colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Søk etter kontakt..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Icon name="close-circle" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Contacts list */}
                <ScrollView
                  style={styles.contactsList}
                  contentContainerStyle={styles.contactsListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {contactsLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={styles.loadingText}>Laster kontakter...</Text>
                    </View>
                  ) : filteredContacts.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Icon name="people-outline" size={48} color={theme.colors.textTertiary} />
                      <Text style={styles.emptyTitle}>
                        {searchQuery ? 'Ingen treff' : 'Ingen kontakter'}
                      </Text>
                      <Text style={styles.emptyText}>
                        {searchQuery
                          ? `Fant ingen kontakter som matcher "${searchQuery}"`
                          : 'Legg til kontakter i Flokken for å kunne invitere dem til aktiviteter'}
                      </Text>
                    </View>
                  ) : (
                    filteredContacts.map(renderContactItem)
                  )}
                </ScrollView>
              </>
            ) : (
              /* Message step */
              <View style={styles.messageStep}>
                {/* Selected contact preview */}
                <View style={styles.selectedContactPreview}>
                  <View style={styles.selectedContactAvatar}>
                    {selectedContact?.avatarUrl ? (
                      <Image
                        source={{ uri: selectedContact.avatarUrl }}
                        style={styles.selectedAvatarImage}
                      />
                    ) : (
                      <View style={[styles.selectedAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.selectedAvatarText}>
                          {(selectedContact?.name || 'M').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.selectedContactInfo}>
                    <Text style={styles.selectedContactName}>{selectedContact?.name || 'Medvandrer'}</Text>
                    <Text style={styles.selectedContactSubtitle}>
                      Vil motta invitasjon til "{activity.title}"
                    </Text>
                  </View>
                </View>

                {/* Personal message input */}
                <View style={styles.messageInputContainer}>
                  <Text style={styles.messageLabel}>Personlig melding (valgfritt)</Text>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Skriv en personlig melding..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={personalMessage}
                    onChangeText={setPersonalMessage}
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{personalMessage.length}/200</Text>
                </View>

                {/* Send button */}
                <TouchableOpacity
                  style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                  onPress={handleSendInvitation}
                  disabled={sending}
                  activeOpacity={0.8}
                >
                  {sending ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <>
                      <Icon name="paper-plane" size={20} color={theme.colors.white} />
                      <Text style={styles.sendButtonText}>Send invitasjon</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 0.15, // Smaller touch area at top, gives more room to modal
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    paddingBottom: 34, // Safe area padding for iPhone
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    marginLeft: -theme.spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginRight: -theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    height: 44,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  contactsList: {
    flex: 1,
    minHeight: 200,
  },
  contactsListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    minHeight: 200,
    flexGrow: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactItemDisabled: {
    opacity: 0.6,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    padding: 2,
    marginRight: theme.spacing.md,
  },
  contactAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  contactSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: theme.colors.textTertiary,
  },
  invitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  invitedText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageStep: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    flex: 1,
  },
  selectedContactPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  selectedContactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: theme.spacing.md,
  },
  selectedAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  selectedAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 24,
  },
  selectedContactInfo: {
    flex: 1,
  },
  selectedContactName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedContactSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  messageInputContainer: {
    marginBottom: theme.spacing.xl,
  },
  messageLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  messageInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    marginTop: 'auto',
    marginBottom: theme.spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});


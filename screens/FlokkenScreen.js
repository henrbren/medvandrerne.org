import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  Image,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useContacts, CONTACT_TYPE } from '../hooks/useContacts';
import { useLocationSharing } from '../hooks/useLocationSharing';
import ContactDetailModal from '../components/modals/ContactDetailModal';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function FlokkenScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);
  
  // Hooks
  const { 
    contacts, 
    loading: contactsLoading, 
    removeContact, 
    loadContacts,
    syncContactsWithBackend,
    getContactsWithLocation,
  } = useContacts();
  
  const { isSharing } = useLocationSharing();

  // State
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set header button for map
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('FlokkenMap')}
          style={styles.headerButton}
        >
          <Icon name="map-outline" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // Always reload contacts when screen gains focus
      loadContacts();
      
      if (!hasAnimatedRef.current) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.normal,
          useNativeDriver: true,
        }).start(() => {
          hasAnimatedRef.current = true;
        });
      } else {
        fadeAnim.setValue(1);
      }
      
      // Sync with backend after a small delay to get fresh data
      const syncTimer = setTimeout(() => {
        syncContactsWithBackend();
      }, 500);
      
      return () => clearTimeout(syncTimer);
    }, [loadContacts])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    await syncContactsWithBackend();
    setRefreshing(false);
  };

  const handleRemoveContact = async (contact) => {
    await removeContact(contact.id);
  };

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleCloseContactDetail = () => {
    setShowContactDetail(false);
    setSelectedContact(null);
  };

  // Split contacts into categories
  const scannedContacts = contacts.filter(c => c.contactType === CONTACT_TYPE.SCANNED);
  const favoriteContacts = contacts.filter(c => c.contactType === CONTACT_TYPE.FAVORITE || c.isFavorite);
  const contactsWithLocation = getContactsWithLocation();

  // Filter contacts based on search
  const filterContacts = (contactList) => {
    if (!searchQuery.trim()) return contactList;
    const query = searchQuery.toLowerCase();
    return contactList.filter(c => 
      (c.name || '').toLowerCase().includes(query) ||
      (c.groupName || '').toLowerCase().includes(query) ||
      (c.levelName || '').toLowerCase().includes(query)
    );
  };

  const filteredFavorites = filterContacts(favoriteContacts);
  const filteredScanned = filterContacts(scannedContacts);
  const hasResults = filteredFavorites.length > 0 || filteredScanned.length > 0;

  // Menu items for Utforsk
  const menuItems = [
    {
      id: 'lokallag',
      title: 'Lokallag',
      description: 'Finn ditt lokallag',
      icon: 'people',
      route: 'Lokallag',
    },
    {
      id: 'kontakt',
      title: 'Kontakt oss',
      description: 'Ta kontakt med Medvandrerne',
      icon: 'call',
      route: 'Kontakt',
    },
  ];

  const renderContactItem = (contact, index, array) => {
    // Check multiple possible image fields
    const imageUrl = contact.avatarUrl || contact.image || contact.coordinatorImage;
    const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0 && imageUrl.startsWith('http');
    
    return (
    <TouchableOpacity
      key={contact.id}
      style={[styles.contactItem, index === array.length - 1 && styles.lastItem]}
      onPress={() => handleContactPress(contact)}
      activeOpacity={0.7}
    >
      <View style={styles.contactAvatar}>
        {hasValidImage ? (
          <Image source={{ uri: imageUrl }} style={styles.contactAvatarImage} />
        ) : (
          <Text style={styles.contactAvatarText}>
            {(contact.name || 'M').charAt(0).toUpperCase()}
          </Text>
        )}
        {contact.location?.sharing && (
          <View style={styles.locationIndicator}>
            <Icon name="location" size={8} color={theme.colors.white} />
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name || 'Medvandrer'}</Text>
        <Text style={styles.contactSubtitle}>
          {contact.levelName || `Nivå ${contact.level || 1}`}
          {contact.groupName ? ` · ${contact.groupName}` : ''}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
  };

  const renderMenuItem = (item, index, array) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, index === array.length - 1 && styles.lastItem]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.id === 'lokallag' ? theme.colors.info + '20' : theme.colors.success + '20' }]}>
        <Icon 
          name={item.icon} 
          size={20} 
          color={item.id === 'lokallag' ? theme.colors.info : theme.colors.success} 
        />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Favorites Section */}
          {filteredFavorites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="star" size={18} color={theme.colors.warning} />
                <Text style={styles.sectionTitle}>Favoritter</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{filteredFavorites.length}</Text>
                </View>
              </View>
              <View style={styles.listCard}>
                {filteredFavorites.map(renderContactItem)}
              </View>
            </View>
          )}

          {/* Scanned Contacts Section */}
          {filteredScanned.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="qr-code" size={18} color={theme.colors.info} />
                <Text style={styles.sectionTitle}>Kontakter</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{filteredScanned.length}</Text>
                </View>
              </View>
              <View style={styles.listCard}>
                {filteredScanned.map(renderContactItem)}
              </View>
            </View>
          )}

          {/* Empty State */}
          {contacts.length === 0 && !searchQuery && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Icon name="people-outline" size={48} color={theme.colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>Ingen kontakter ennå</Text>
              <Text style={styles.emptyText}>
                Scan en Medvandrerkode eller legg til koordinatorer som favoritter
              </Text>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={() => navigation.navigate('Profil', { openScanner: true })}
              >
                <Icon name="qr-code-outline" size={18} color={theme.colors.white} />
                <Text style={styles.scanButtonText}>Scan en kode</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No Search Results */}
          {searchQuery && !hasResults && (
            <View style={styles.emptyState}>
              <Icon name="search-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>Ingen treff</Text>
              <Text style={styles.emptyText}>
                Fant ingen kontakter som matcher "{searchQuery}"
              </Text>
            </View>
          )}

          {/* Utforsk Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="compass" size={18} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Utforsk</Text>
            </View>
            <View style={styles.listCard}>
              {menuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Add Contact Button */}
          {contacts.length > 0 && (
            <TouchableOpacity 
              style={styles.addContactButton}
              onPress={() => navigation.navigate('Profil', { openScanner: true })}
            >
              <Icon name="add" size={20} color={theme.colors.primary} />
              <Text style={styles.addContactText}>Legg til kontakt</Text>
            </TouchableOpacity>
          )}

          {/* Bottom spacer for search bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Search Bar at Bottom */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={theme.colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Søk i kontakter..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        visible={showContactDetail}
        onClose={handleCloseContactDetail}
        contact={selectedContact}
        onRemove={handleRemoveContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 11,
  },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  contactAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  locationIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  contactSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  menuDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: theme.spacing.lg,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  scanButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  addContactText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 80,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    padding: 0,
  },
});

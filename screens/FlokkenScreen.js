import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useContacts } from '../hooks/useContacts';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function FlokkenScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);
  const { contacts, loading: contactsLoading, removeContact, loadContacts } = useContacts();

  useFocusEffect(
    useCallback(() => {
      // Reload contacts when screen comes into focus
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
    }, [])
  );

  const handleRemoveContact = (contact) => {
    Alert.alert(
      'Fjern kontakt',
      `Er du sikker på at du vil fjerne ${contact.name || 'denne medvandreren'} fra listen?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Fjern', 
          style: 'destructive',
          onPress: async () => {
            await removeContact(contact.id);
          }
        },
      ]
    );
  };

  const AnimatedSection = ({ children, delay = 0 }) => {
    const cardFade = useRef(new Animated.Value(hasAnimatedRef.current ? 1 : 0)).current;
    const cardSlide = useRef(new Animated.Value(hasAnimatedRef.current ? 0 : 20)).current;

    useEffect(() => {
      if (!hasAnimatedRef.current) {
        Animated.parallel([
          Animated.timing(cardFade, {
            toValue: 1,
            duration: theme.animations.normal,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(cardSlide, {
            toValue: 0,
            delay,
            ...theme.animations.spring,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [delay]);

    return (
      <Animated.View
        style={{
          opacity: cardFade,
          transform: [{ translateY: cardSlide }],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  const menuItems = [
    {
      id: 'lokallag',
      title: 'Lokallag',
      description: 'Finn ditt lokallag og bli med på aktiviteter',
      icon: 'people',
      route: 'Lokallag',
      colors: [theme.colors.info, theme.colors.info + 'CC'],
    },
    {
      id: 'om-oss',
      title: 'Om oss',
      description: 'Lær mer om Medvandrerne og vår visjon',
      icon: 'information-circle',
      route: 'Om oss',
      colors: [theme.colors.primary, theme.colors.primaryLight],
    },
    {
      id: 'kontakt',
      title: 'Kontakt',
      description: 'Ta kontakt med oss eller finn ansatte',
      icon: 'call',
      route: 'Kontakt',
      colors: [theme.colors.success, theme.colors.success + 'CC'],
    },
  ];

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
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Header Section */}
        <AnimatedSection>
          <View style={styles.headerSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.headerIconGradient}
              >
                <Icon name="people" size={32} color={theme.colors.white} />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Flokken</Text>
            </View>
            <Text style={styles.headerDescription}>
              Utforsk lokallag, lær mer om oss, eller ta kontakt
            </Text>
          </View>
        </AnimatedSection>

        {/* My Contacts / Mine Medvandrere */}
        {contacts.length > 0 && (
          <AnimatedSection delay={100}>
            <View style={styles.contactsSection}>
              <View style={styles.contactsHeader}>
                <Icon name="qr-code" size={24} color={theme.colors.primary} />
                <Text style={styles.contactsTitle}>Mine Medvandrere</Text>
                <Text style={styles.contactsCount}>{contacts.length}</Text>
              </View>
              <Text style={styles.contactsSubtitle}>
                Folk du har scannet med Medvandrerkode
              </Text>
              
              <View style={styles.contactsList}>
                {contacts.map((contact, index) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactCard}
                    onLongPress={() => handleRemoveContact(contact)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contactAvatar}>
                      {contact.avatarUrl ? (
                        <Image source={{ uri: contact.avatarUrl }} style={styles.contactAvatarImage} />
                      ) : (
                        <Text style={styles.contactAvatarText}>
                          {(contact.name || 'M').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name || 'Medvandrer'}</Text>
                      <View style={styles.contactLevel}>
                        <Icon name="shield-checkmark" size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.contactLevelText}>
                          Nivå {contact.level || 1} • {contact.levelName || 'Nybegynner'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.contactDate}>
                      {new Date(contact.addedAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.contactsHint}>
                Hold inne på en kontakt for å fjerne
              </Text>
            </View>
          </AnimatedSection>
        )}

        {/* Empty State for Contacts */}
        {contacts.length === 0 && (
          <AnimatedSection delay={100}>
            <View style={styles.emptyContacts}>
              <View style={styles.emptyContactsIcon}>
                <Icon name="qr-code-outline" size={48} color={theme.colors.textTertiary} />
              </View>
              <Text style={styles.emptyContactsTitle}>Ingen medvandrere ennå</Text>
              <Text style={styles.emptyContactsText}>
                Scan en Medvandrerkode fra en annen bruker for å legge dem til i listen din.
              </Text>
              <TouchableOpacity 
                style={styles.emptyContactsButton}
                onPress={() => navigation.navigate('Profil', { openScanner: true })}
              >
                <Icon name="scan" size={18} color={theme.colors.white} />
                <Text style={styles.emptyContactsButtonText}>Scan en kode</Text>
              </TouchableOpacity>
            </View>
          </AnimatedSection>
        )}

        {/* Menu Items */}
        <AnimatedSection delay={contacts.length > 0 ? 200 : 100}>
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={item.colors}
                  style={styles.menuCardGradient}
                >
                  <View style={styles.menuCardContent}>
                    <View style={styles.menuIconContainer}>
                      <Icon name={item.icon} size={32} color={theme.colors.white} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </View>
                    <Icon name="chevron-forward" size={24} color={theme.colors.white} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  topSpacer: {
    height: theme.spacing.md,
  },
  headerSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glowSubtle,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flex: 1,
  },
  headerDescription: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    paddingLeft: theme.spacing.xl + theme.spacing.md,
  },
  menuSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  menuCardGradient: {
    padding: theme.spacing.lg,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs / 2,
  },
  menuDescription: {
    ...theme.typography.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },

  // Contacts Section
  contactsSection: {
    paddingHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  contactsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  contactsCount: {
    ...theme.typography.caption,
    color: theme.colors.white,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  contactsSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xl + theme.spacing.sm,
  },
  contactsList: {
    gap: theme.spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contactAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactAvatarText: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  contactLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  contactLevelText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  contactDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  contactsHint: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },

  // Empty State
  emptyContacts: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    marginHorizontal: isWeb ? 0 : theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
  emptyContactsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyContactsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyContactsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  emptyContactsButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
});


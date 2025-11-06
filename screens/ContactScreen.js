import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import {
  ADMINISTRATION,
  BOARD,
  ORGANIZATION_INFO,
} from '../constants/data';

export default function ContactScreen() {
  const handlePhonePress = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Administration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Administrasjon</Text>
          </View>
          {ADMINISTRATION.map((person) => (
            <View key={person.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={styles.contactAvatar}>
                  <Icon name="person-circle-outline" size={40} color={theme.colors.primary} />
                </View>
                <View style={styles.contactHeaderText}>
                  <Text style={styles.role}>{person.role}</Text>
                  <Text style={styles.name}>{person.name}</Text>
                </View>
              </View>

              <View style={styles.contactActions}>
                {person.phone && (
                  <TouchableOpacity
                    style={styles.contactActionButton}
                    onPress={() => handlePhonePress(person.phone)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconContainer}>
                      <Icon name="call-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.contactActionText}>{person.phone}</Text>
                  </TouchableOpacity>
                )}

                {person.email && (
                  <TouchableOpacity
                    style={styles.contactActionButton}
                    onPress={() => handleEmailPress(person.email)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconContainer}>
                      <Icon name="mail-outline" size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.contactActionText}>{person.email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Board Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Styret</Text>
          </View>
          <View style={styles.boardCard}>
            <View style={styles.boardLeaderContainer}>
              <View style={styles.boardIconContainer}>
                <Icon name="trophy" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.boardContent}>
                <Text style={styles.boardRole}>Styreleder</Text>
                <Text style={styles.boardName}>{BOARD.leader}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.boardMembersTitle}>Styremedlemmer:</Text>
          {BOARD.members.map((member, index) => (
            <View key={index} style={styles.boardMemberCard}>
              <View style={styles.memberIconContainer}>
                <Icon name="person-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.boardMemberName}>{member}</Text>
            </View>
          ))}
        </View>

        {/* Organization Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Organisasjonsinformasjon</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="business-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Organisasjonsnummer</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.orgNumber}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="card-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bankkonto</Text>
                <Text style={styles.infoValue}>
                  {ORGANIZATION_INFO.bankAccount}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="phone-portrait-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>VIPPS</Text>
                <Text style={styles.infoValue}>{ORGANIZATION_INFO.vipps}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="location-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>
                  {ORGANIZATION_INFO.address}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(ORGANIZATION_INFO.website)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="globe-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nettsted</Text>
                <Text style={styles.link}>{ORGANIZATION_INFO.website}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Støtt oss</Text>
          </View>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() =>
              Linking.openURL('https://spleis.no/medvandrerne')
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.primaryLight, theme.colors.gradientLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.supportButtonGradient}
            >
              <Icon name="heart-outline" size={24} color={theme.colors.white} />
              <Text style={styles.supportButtonText}>Støtt på Spleis.no</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.supportText}>
            Vi setter stor pris på all støtte, både økonomisk og gjennom deltakelse
            på aktiviteter og arrangementer.
          </Text>
        </View>

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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    ...theme.shadows.large,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  contactCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contactAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  contactHeaderText: {
    flex: 1,
  },
  role: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  contactActions: {
    marginTop: theme.spacing.xs,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  actionIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  contactActionText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  boardCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  boardLeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  boardContent: {
    flex: 1,
  },
  boardRole: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  boardName: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  boardMembersTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  boardMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  memberIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  boardMemberName: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoIconContainer: {
    width: 40,
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  link: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  supportButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.xl,
    ...theme.shadows.glow,
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  supportButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '800',
    marginLeft: theme.spacing.sm,
    fontSize: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  supportText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

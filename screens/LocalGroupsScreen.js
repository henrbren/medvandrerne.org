import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { LOCAL_GROUPS } from '../constants/data';

export default function LocalGroupsScreen() {
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

  const handleFacebookPress = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Lokallagene våre</Text>
          </View>
          <Text style={styles.introText}>
            Her har du en oversikt over våre lokale Facebookgrupper. Hvert enkelt
            lokallag har faste turer, minst en dag i uken. I tillegg postes det
            sosiale arrangementer og invitasjoner til større aktiviteter som
            motivasjonsturer, miljøaksjoner og deltakelse på større sports- og
            kulturarrangementer som Femundløpet, frivilighetskorps på Tons of Rock,
            Rein Sognefjord og liknende.
          </Text>
        </View>

        {/* Local Groups */}
        {LOCAL_GROUPS.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIconContainer}>
                <Icon name="people" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.groupName}>{group.name}</Text>
            </View>

            {group.coordinator && (
              <View style={styles.contactRow}>
                <View style={styles.contactIconContainer}>
                  <Icon name="person-outline" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Koordinator</Text>
                  <Text style={styles.contactValue}>{group.coordinator}</Text>
                </View>
              </View>
            )}

            {group.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => handlePhonePress(group.phone)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name="call-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Telefon</Text>
                  <Text style={styles.contactLink}>{group.phone}</Text>
                </View>
              </TouchableOpacity>
            )}

            {group.email && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => handleEmailPress(group.email)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name="mail-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>E-post</Text>
                  <Text style={styles.contactLink}>{group.email}</Text>
                </View>
              </TouchableOpacity>
            )}

            {group.facebook && (
              <TouchableOpacity
                style={styles.facebookButton}
                onPress={() => handleFacebookPress(group.facebook)}
                activeOpacity={0.8}
              >
                <View style={styles.facebookIconContainer}>
                  <Icon name="logo-facebook" size={22} color="#1877F2" />
                </View>
                <Text style={styles.facebookText}>Facebook-gruppe</Text>
                <View style={styles.facebookArrow}>
                  <Icon name="chevron-forward-outline" size={20} color="#1877F2" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Facebook Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="logo-facebook" size={24} color="#1877F2" />
            <Text style={styles.sectionTitle}>Medvandrerne på Facebook</Text>
          </View>
          
          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() =>
              handleFacebookPress(
                'https://www.facebook.com/MedNaturenSomMetode/'
              )
            }
            activeOpacity={0.8}
          >
            <View style={styles.facebookIconContainer}>
              <Icon name="logo-facebook" size={22} color="#1877F2" />
            </View>
            <Text style={styles.facebookText}>Stiftelsen Medvandrerne - Hjem</Text>
            <View style={styles.facebookArrow}>
              <Icon name="chevron-forward-outline" size={20} color="#1877F2" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() =>
              handleFacebookPress(
                'https://www.facebook.com/groups/218262935581083'
              )
            }
            activeOpacity={0.8}
          >
            <View style={styles.facebookIconContainer}>
              <Icon name="logo-facebook" size={22} color="#1877F2" />
            </View>
            <Text style={styles.facebookText}>Venner av Medvandrerne</Text>
            <View style={styles.facebookArrow}>
              <Icon name="chevron-forward-outline" size={20} color="#1877F2" />
            </View>
          </TouchableOpacity>
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
  introText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  groupCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    ...theme.shadows.large,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.borderLight,
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  groupName: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  contactIconContainer: {
    width: 36,
    alignItems: 'center',
    marginTop: 2,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  contactLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#E4E6EB',
    ...theme.shadows.medium,
  },
  facebookIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#1877F2' + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  facebookText: {
    ...theme.typography.body,
    color: '#1877F2',
    fontWeight: '600',
    flex: 1,
  },
  facebookArrow: {
    marginLeft: theme.spacing.sm,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

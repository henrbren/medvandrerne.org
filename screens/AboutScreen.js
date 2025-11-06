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
import {
  ORGANIZATION_INFO,
  MISSION,
  CORE_ACTIVITIES,
  SUPPORTERS,
} from '../constants/data';

export default function AboutScreen() {
  const handlePress = (url) => {
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
        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Om Medvandrerne</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{MISSION.description}</Text>
            <Text style={styles.text}>{MISSION.nature}</Text>
            <Text style={styles.text}>{MISSION.equality}</Text>
            <Text style={styles.text}>{MISSION.responsibility}</Text>
          </View>
        </View>

        {/* Values and Symbols */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Verdier og symboler</Text>
          </View>
          
          <View style={styles.valueCard}>
            <View style={styles.valueIconContainer}>
              <Icon name="heart-outline" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Salutogenese og Recovery</Text>
              <Text style={styles.valueText}>
                Vi fokuserer på det som gjør den enkelte frisk og flytter fokus
                vekk fra selve «sykdomsbildet».
              </Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={styles.valueIconContainer}>
              <Icon name="map" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Naturen som metode</Text>
              <Text style={styles.valueText}>
                Naturen spiller en sentral rolle i vårt konsept. Vi arrangerer
                turer som utfordrer og gir muligheter for vekst.
              </Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={styles.valueIconContainer}>
              <Icon name="people-outline" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Likestilling og fellesskap</Text>
              <Text style={styles.valueText}>
                På turene er alle likestilte. Vi deler erfaringer rundt bålet og
                skaper en følelse av tilhørighet.
              </Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={styles.valueIconContainer}>
              <Icon name="trophy" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Mestring og ansvar</Text>
              <Text style={styles.valueText}>
                Gjennom å mestre utfordringer i naturen får deltakerne økt
                selvtillit og mestringsfølelse.
              </Text>
            </View>
          </View>
        </View>

        {/* Core Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="trophy" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Kjernevirksomhet</Text>
          </View>
          {CORE_ACTIVITIES.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIconContainer}>
                <Icon name={activity.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Organization Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Organisasjonsinformasjon</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Navn:</Text>
              <Text style={styles.infoValue}>{ORGANIZATION_INFO.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organisasjonsnummer:</Text>
              <Text style={styles.infoValue}>{ORGANIZATION_INFO.orgNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adresse:</Text>
              <Text style={styles.infoValue}>{ORGANIZATION_INFO.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kommune:</Text>
              <Text style={styles.infoValue}>{ORGANIZATION_INFO.municipality}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stiftelsesdato:</Text>
              <Text style={styles.infoValue}>03.01.2022</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Formål:</Text>
              <Text style={styles.infoValue}>
                Legge til rette for unike opplevelser og turer i naturen gjennom
                motivasjonsturer, frivillig arbeid, erfaringsformidling, læring og
                andre sosiale aktiviteter.
              </Text>
            </View>
          </View>
        </View>

        {/* Supporters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Takk til våre støttespillere</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Økonomiske støttespillere:</Text>
          <View style={styles.supporterList}>
            {SUPPORTERS.financial.map((supporter, index) => (
              <View key={index} style={styles.supporterItem}>
                <View style={styles.supporterBullet} />
                <Text style={styles.supporterText}>{supporter}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subsectionTitle}>Samarbeidspartnere:</Text>
          <View style={styles.supporterList}>
            {SUPPORTERS.partners.map((partner, index) => (
              <View key={index} style={styles.supporterItem}>
                <View style={styles.supporterBullet} />
                <Text style={styles.supporterText}>{partner}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subsectionTitle}>Gode venner:</Text>
          <View style={styles.supporterList}>
            {SUPPORTERS.friends.map((friend, index) => (
              <View key={index} style={styles.supporterItem}>
                <View style={styles.supporterBullet} />
                <Text style={styles.supporterText}>{friend}</Text>
              </View>
            ))}
          </View>
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
  textContainer: {
    marginTop: theme.spacing.sm,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  valueCard: {
    flexDirection: 'row',
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
  valueIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  valueText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  activityCard: {
    flexDirection: 'row',
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
  activityIconContainer: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  activityDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  infoContainer: {
    marginTop: theme.spacing.sm,
  },
  infoRow: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  subsectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 16,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  supporterList: {
    marginBottom: theme.spacing.md,
  },
  supporterItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  supporterBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
    marginRight: theme.spacing.sm,
  },
  supporterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

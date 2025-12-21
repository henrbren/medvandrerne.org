import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useLocationSharing } from '../hooks/useLocationSharing';

export default function FlokkenSettingsScreen({ navigation }) {
  const { 
    isSharing, 
    toggleLocationSharing, 
    permissionStatus,
    currentLocation 
  } = useLocationSharing();

  const handleToggleLocationSharing = async () => {
    await toggleLocationSharing();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Sharing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posisjonsdeling</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Icon 
                  name={isSharing ? "location" : "location-outline"} 
                  size={24} 
                  color={isSharing ? theme.colors.success : theme.colors.textSecondary} 
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Del min posisjon</Text>
                <Text style={styles.settingDescription}>
                  {isSharing 
                    ? 'Kontaktene dine kan se hvor du er' 
                    : 'La kontaktene dine se deg på kartet'
                  }
                </Text>
              </View>
              <Switch
                value={isSharing}
                onValueChange={handleToggleLocationSharing}
                trackColor={{ false: theme.colors.border, true: theme.colors.success + '80' }}
                thumbColor={isSharing ? theme.colors.success : theme.colors.surface}
              />
            </View>
            
            {isSharing && currentLocation && (
              <View style={styles.locationStatus}>
                <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.locationStatusText}>
                  Posisjonen din deles med kontaktene dine
                </Text>
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle" size={20} color={theme.colors.info} />
              <Text style={styles.infoTitle}>Hva innebærer posisjonsdeling?</Text>
            </View>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Icon name="people-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  Kun kontakter i din Flokken-liste kan se posisjonen din
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="map-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  Du vises på kartet i Flokken-fanen for de som har deg som kontakt
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  Posisjonen oppdateres når du bruker appen
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="shield-checkmark-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  Du kan slå av deling når som helst
                </Text>
              </View>
            </View>
          </View>

          {/* Permission Status */}
          {permissionStatus === 'denied' && (
            <View style={styles.warningBox}>
              <Icon name="warning" size={20} color={theme.colors.warning} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Tilgang til posisjon er avslått</Text>
                <Text style={styles.warningText}>
                  For å dele posisjonen din må du gi appen tilgang til posisjonstjenester i innstillingene.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personvern</Text>
          
          <View style={styles.privacyCard}>
            <Icon name="lock-closed" size={24} color={theme.colors.primary} />
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Din data er trygg</Text>
              <Text style={styles.privacyText}>
                Posisjonsdata lagres kun midlertidig og slettes automatisk når du slår av deling. 
                Vi deler aldri posisjonen din med tredjeparter.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  settingDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  locationStatusText: {
    ...theme.typography.caption,
    color: theme.colors.success,
  },
  infoBox: {
    backgroundColor: theme.colors.info + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.info + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.body,
    color: theme.colors.info,
    fontWeight: '600',
  },
  infoList: {
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.warning + '15',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warning + '30',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...theme.typography.body,
    color: theme.colors.warning,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

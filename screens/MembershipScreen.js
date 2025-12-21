import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function MembershipScreen({ navigation }) {
  const { user, getMembershipTiers, token, refreshUserData, updateUserData } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentMembership = user?.membership;

  useEffect(() => {
    loadTiers();
  }, []);

  // Refresh user data when screen comes into focus (only once per focus)
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const loadTiers = async () => {
    const result = await getMembershipTiers();
    if (result.success) {
      setTiers(result.tiers);
    }
    setLoading(false);
  };

  const handleChangeMembership = async (tierId) => {
    if (tierId === currentMembership?.tier) {
      Alert.alert('Allerede valgt', 'Du har allerede dette medlemskapsnivået.');
      return;
    }

    const tier = tiers.find(t => t.id === tierId);
    const isUpgrade = tier.price > (currentMembership?.price || 0);

    Alert.alert(
      isUpgrade ? 'Oppgrader medlemskap' : 'Endre medlemskap',
      `Vil du bytte til ${tier.name} (${tier.price} kr/mnd)?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Bekreft',
          onPress: async () => {
            setChanging(true);
            setSelectedTier(tierId);
            
            try {
              console.log('Changing membership to:', tierId);
              console.log('Token:', token ? 'Present' : 'Missing');
              
              const response = await fetch('https://henrikb30.sg-host.com/api/membership/change.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ newTier: tierId }),
              });

              console.log('Response status:', response.status);
              const data = await response.json();
              console.log('Response data:', JSON.stringify(data));

              if (data.success) {
                // Update user state directly from API response
                if (data.user) {
                  console.log('Updating user with new membership:', data.user.membership?.tierName);
                  await updateUserData(data.user);
                } else {
                  console.log('No user in response, forcing refresh');
                  await refreshUserData();
                }
                
                Alert.alert(
                  'Medlemskap endret!',
                  `Du har valgt ${tier.name}. Fullfør betalingen for å aktivere.`,
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.goBack()
                  }]
                );
              } else {
                console.log('API error:', data.error);
                Alert.alert('Feil', data.error || 'Kunne ikke endre medlemskap');
              }
            } catch (error) {
              console.log('Network error:', error);
              Alert.alert('Feil', 'Nettverksfeil - prøv igjen: ' + error.message);
            } finally {
              setChanging(false);
              setSelectedTier(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Laster medlemskap...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Current Membership */}
      {currentMembership && (
        <View style={styles.currentSection}>
          <Text style={styles.sectionTitle}>Ditt medlemskap</Text>
          <View style={[styles.currentCard, { borderColor: getTierColor(currentMembership.tier) }]}>
            <View style={[styles.currentBadge, { backgroundColor: getTierColor(currentMembership.tier) }]}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.white} />
              <Text style={styles.currentBadgeText}>{currentMembership.tierName}</Text>
            </View>
            <View style={styles.currentDetails}>
              <View style={styles.currentRow}>
                <Text style={styles.currentLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  currentMembership.status === 'active' && styles.statusActive,
                  currentMembership.status === 'pending' && styles.statusPending,
                ]}>
                  <Text style={styles.statusText}>
                    {currentMembership.status === 'active' ? 'Aktiv' : 
                     currentMembership.status === 'pending' ? 'Venter på betaling' : 'Utløpt'}
                  </Text>
                </View>
              </View>
              <View style={styles.currentRow}>
                <Text style={styles.currentLabel}>Pris:</Text>
                <Text style={styles.currentValue}>{currentMembership.price} kr/mnd</Text>
              </View>
              {currentMembership.expiresAt && currentMembership.status === 'active' && (
                <View style={styles.currentRow}>
                  <Text style={styles.currentLabel}>Utløper:</Text>
                  <Text style={styles.currentValue}>
                    {new Date(currentMembership.expiresAt).toLocaleDateString('nb-NO')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Available Tiers */}
      <View style={styles.tiersSection}>
        <Text style={styles.sectionTitle}>
          {currentMembership ? 'Endre medlemskap' : 'Velg medlemskap'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {currentMembership 
            ? 'Velg et nytt nivå for å oppgradere eller endre' 
            : 'Velg det nivået som passer deg best'}
        </Text>

        <View style={styles.tiersGrid}>
          {tiers.map((tier) => {
            const isCurrent = currentMembership?.tier === tier.id;
            const isUpgrade = currentMembership && tier.price > (currentMembership.price || 0);
            const isDowngrade = currentMembership && tier.price < (currentMembership.price || 0);

            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  isCurrent && styles.tierCardCurrent,
                  { borderColor: tier.color },
                ]}
                onPress={() => !isCurrent && handleChangeMembership(tier.id)}
                disabled={isCurrent || changing}
                activeOpacity={0.7}
              >
                {tier.popular && !isCurrent && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Populær</Text>
                  </View>
                )}
                
                {isCurrent && (
                  <View style={[styles.currentIndicator, { backgroundColor: tier.color }]}>
                    <Icon name="checkmark" size={14} color={theme.colors.white} />
                    <Text style={styles.currentIndicatorText}>Ditt valg</Text>
                  </View>
                )}

                <View style={[styles.tierHeader, { backgroundColor: tier.color }]}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <View style={styles.tierPriceContainer}>
                    <Text style={styles.tierPrice}>{tier.price}</Text>
                    <Text style={styles.tierPeriod}>kr/mnd</Text>
                  </View>
                </View>

                <View style={styles.tierBody}>
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                  
                  <View style={styles.tierFeatures}>
                    {tier.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isCurrent && (
                    <View style={[styles.tierAction, { backgroundColor: tier.color }]}>
                      {changing && selectedTier === tier.id ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                      ) : (
                        <Text style={styles.tierActionText}>
                          {isUpgrade ? 'Oppgrader' : isDowngrade ? 'Velg' : 'Velg'}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Icon name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.infoText}>
          Ved endring av medlemskap vil det nye nivået tre i kraft etter betaling. 
          Kontakt oss for spørsmål om fakturering.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function getTierColor(tierId) {
  const colors = {
    supporter: '#9E9E9E',
    member: '#42A5F5',
    family: '#66BB6A',
    patron: '#FFA726',
  };
  return colors[tierId] || theme.colors.primary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },

  // Current Section
  currentSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  currentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  currentBadgeText: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  currentDetails: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  currentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  currentValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.textTertiary,
  },
  statusActive: {
    backgroundColor: theme.colors.success,
  },
  statusPending: {
    backgroundColor: theme.colors.warning,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '600',
  },

  // Tiers Section
  tiersSection: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  tiersGrid: {
    gap: theme.spacing.lg,
  },
  tierCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  tierCardCurrent: {
    opacity: 0.7,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    zIndex: 10,
  },
  popularText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  currentIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    zIndex: 10,
  },
  currentIndicatorText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  tierHeader: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  tierName: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: '700',
  },
  tierPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: theme.spacing.sm,
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.white,
  },
  tierPeriod: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    marginLeft: theme.spacing.xs,
  },
  tierBody: {
    padding: theme.spacing.lg,
  },
  tierDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  tierFeatures: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  tierAction: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  tierActionText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: theme.spacing.xxxl,
  },
});

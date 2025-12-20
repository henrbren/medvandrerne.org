import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function MembershipSelector({ onSelect, onBack, phone }) {
  const { getMembershipTiers, loading: authLoading } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTiers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadTiers = async () => {
    const result = await getMembershipTiers();
    if (result.success) {
      setTiers(result.tiers);
    }
    setLoading(false);
  };

  const handleSelect = (tier) => {
    setSelectedTier(tier.id);
  };

  const handleContinue = () => {
    if (selectedTier) {
      onSelect(selectedTier);
    }
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Velg medlemskap</Text>
          <Text style={styles.subtitle}>
            Støtt Medvandrerne og få tilgang til alle funksjoner
          </Text>
        </View>

        {/* Tiers */}
        <View style={styles.tiersContainer}>
          {tiers.map((tier, index) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                selectedTier === tier.id && styles.tierCardSelected,
                tier.popular && styles.tierCardPopular,
              ]}
              onPress={() => handleSelect(tier)}
              activeOpacity={0.7}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Populær</Text>
                </View>
              )}
              
              <View style={[styles.tierHeader, { backgroundColor: tier.color }]}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceAmount}>{tier.price}</Text>
                  <Text style={styles.pricePeriod}>kr/mnd</Text>
                </View>
              </View>

              <View style={styles.tierBody}>
                <Text style={styles.tierDescription}>{tier.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {tier.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {selectedTier === tier.id && (
                <View style={styles.selectedIndicator}>
                  <Icon name="checkmark-circle" size={24} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Icon name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            Betaling skjer via Vipps eller kort. Du kan når som helst avslutte medlemskapet.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedTier && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedTier || authLoading}
        >
          <LinearGradient
            colors={selectedTier 
              ? [theme.colors.primary, theme.colors.primaryLight]
              : [theme.colors.textTertiary, theme.colors.textTertiary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            {authLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Text style={styles.continueButtonText}>
                  {selectedTier ? 'Fortsett til betaling' : 'Velg et medlemskap'}
                </Text>
                <Icon name="arrow-forward" size={20} color={theme.colors.white} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Animated.View>
  );
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
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  tiersContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  tierCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  tierCardSelected: {
    borderColor: theme.colors.primary,
  },
  tierCardPopular: {
    borderColor: theme.colors.warning,
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
  tierHeader: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  tierName: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: '700',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: theme.spacing.sm,
  },
  priceAmount: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: '800',
  },
  pricePeriod: {
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
  featuresContainer: {
    gap: theme.spacing.sm,
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
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  continueButton: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  bottomSpacer: {
    height: theme.spacing.xxxl,
  },
});

import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function FlokkenScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
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

        {/* Menu Items */}
        <AnimatedSection delay={100}>
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
});


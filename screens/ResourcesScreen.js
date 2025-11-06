import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// Resource data
const RESOURCES = [
  {
    id: 1,
    title: 'Recovery og Salutogenese',
    description: 'Lær mer om vårt fundamentale perspektiv på recovery og helse.',
    icon: 'medical',
    type: 'Artikkel',
    url: 'https://medvandrerne.org/recovery',
    category: 'Teori',
  },
  {
    id: 2,
    title: 'Utendørsterapi Guide',
    description: 'Komplett guide for lokallag som ønsker å starte utendørsterapi.',
    icon: 'book',
    type: 'Guide',
    url: 'https://medvandrerne.org/utendorsguide',
    category: 'Praktisk',
  },
  {
    id: 3,
    title: 'Miljø og bærekraft',
    description: 'Vårt arbeid med miljøvern og bærekraftig friluftsliv.',
    icon: 'leaf',
    type: 'Rapport',
    url: 'https://medvandrerne.org/miljo',
    category: 'Miljø',
  },
  {
    id: 4,
    title: 'Femundløpet Informasjon',
    description: 'Alt du trenger å vite om verdens største skitur.',
    icon: 'snow',
    type: 'Informasjon',
    url: 'https://femundlopet.no',
    category: 'Arrangement',
  },
  {
    id: 5,
    title: 'Lokallagsveileder',
    description: 'Hvordan starte og drive et lokallag i Medvandrerne.',
    icon: 'people',
    type: 'Veileder',
    url: 'https://medvandrerne.org/lokallag',
    category: 'Organisasjon',
  },
  {
    id: 6,
    title: 'Friskus Programmet',
    description: 'Vårt strukturert program for recovery gjennom naturen.',
    icon: 'fitness',
    type: 'Program',
    url: 'https://medvandrerne.org/friskus',
    category: 'Programmer',
  },
];

const CATEGORIES = ['Alle', 'Teori', 'Praktisk', 'Miljø', 'Arrangement', 'Organisasjon', 'Programmer'];

export default function ResourcesScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState('Alle');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: theme.animations.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const AnimatedCard = ({ children, delay = 0, style }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: theme.animations.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: theme.animations.normal,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          style,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  };

  const filteredResources = selectedCategory === 'Alle'
    ? RESOURCES
    : RESOURCES.filter(resource => resource.category === selectedCategory);

  const handleResourcePress = (resource) => {
    Linking.openURL(resource.url).catch(() => {
      // Handle error - could show alert
      console.log('Could not open URL:', resource.url);
    });
  };

  const CategoryButton = ({ category, isActive }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        isActive && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.categoryButtonText,
        isActive && styles.categoryButtonTextActive
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'Artikkel': return theme.colors.primary;
      case 'Guide': return theme.colors.secondary;
      case 'Rapport': return theme.colors.accent;
      case 'Informasjon': return theme.colors.info;
      case 'Veileder': return theme.colors.warning;
      case 'Program': return theme.colors.success;
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerSection}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Icon name="library" size={32} color={theme.colors.white} />
              </View>
              <Text style={styles.headerTitle}>Ressurser</Text>
              <Text style={styles.headerSubtitle}>Lær og utvikle deg</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Category Filter */}
        <AnimatedCard delay={100}>
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {CATEGORIES.map((category, index) => (
                <CategoryButton
                  key={category}
                  category={category}
                  isActive={selectedCategory === category}
                />
              ))}
            </ScrollView>
          </View>
        </AnimatedCard>

        {/* Resources List */}
        {filteredResources.map((resource, index) => (
          <AnimatedCard key={resource.id} delay={index * 50 + 200}>
            <TouchableOpacity
              style={styles.resourceCard}
              onPress={() => handleResourcePress(resource)}
              activeOpacity={0.9}
            >
              <View style={styles.resourceHeader}>
                <View style={styles.resourceIconContainer}>
                  <LinearGradient
                    colors={[getTypeColor(resource.type) + '20', getTypeColor(resource.type) + '10']}
                    style={styles.resourceIconGradient}
                  >
                    <Icon name={resource.icon} size={24} color={getTypeColor(resource.type)} />
                  </LinearGradient>
                </View>
                <View style={styles.resourceMeta}>
                  <Text style={styles.resourceType}>{resource.type}</Text>
                  <Text style={styles.resourceCategory}>{resource.category}</Text>
                </View>
              </View>

              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>

              <View style={styles.resourceFooter}>
                <View style={styles.resourceAction}>
                  <Text style={styles.resourceActionText}>Les mer</Text>
                  <Icon name="chevron-forward-outline" size={16} color={theme.colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {/* Contact Section */}
        <AnimatedCard delay={filteredResources.length * 50 + 300}>
          <View style={styles.contactSection}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.secondary + '10']}
              style={styles.contactGradient}
            >
              <View style={styles.contactIconContainer}>
                <Icon name="help-circle" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.contactTitle}>Trenger du hjelp?</Text>
              <Text style={styles.contactText}>
                Kontakt vår fagansvarlige eller lokallagskoordinator for
                spørsmål om ressursene eller vårt arbeid.
              </Text>
              <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.contactButtonGradient}
                >
                  <Text style={styles.contactButtonText}>Kontakt oss</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </AnimatedCard>

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
  headerWrapper: {
    marginBottom: theme.spacing.lg,
  },
  headerSection: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.xl,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.95,
    fontStyle: 'italic',
    fontSize: 18,
    fontWeight: '500',
  },
  categorySection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  categoryScrollContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  categoryButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
  },
  resourceCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resourceIconContainer: {
    marginRight: theme.spacing.md,
  },
  resourceIconGradient: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceMeta: {
    flex: 1,
  },
  resourceType: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceCategory: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  resourceContent: {
    marginBottom: theme.spacing.md,
  },
  resourceTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  resourceDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  resourceAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceActionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  contactSection: {
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  contactGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  contactTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  contactText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  contactButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    ...theme.shadows.large,
  },
  contactButtonGradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  contactButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

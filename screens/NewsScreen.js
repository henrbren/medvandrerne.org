import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// Sample news data - in a real app this would come from an API
const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Nytt samarbeid med Gjensidigestiftelsen',
    date: '2025-11-15',
    excerpt: 'Vi er stolte av å annonsere et nytt samarbeid med Gjensidigestiftelsen som vil styrke vår støtte til rusavhengige.',
    image: 'https://via.placeholder.com/400x200/D32F2F/FFFFFF?text=Nytt+Samarbeid',
    readTime: '2 min',
    category: 'Samarbeid',
  },
  {
    id: 2,
    title: 'Femundløpet 2026 - Påmelding åpnet',
    date: '2025-11-10',
    excerpt: 'Påmelding til Femundløpet 2026 er nå åpen. Vi ser frem til en fantastisk uke med mestring og fellesskap.',
    image: 'https://via.placeholder.com/400x200/D32F2F/FFFFFF?text=Femundl%C3%B8pet',
    readTime: '3 min',
    category: 'Arrangement',
  },
  {
    id: 3,
    title: 'Lokallag Bergen arrangerer høsttur',
    date: '2025-11-08',
    excerpt: 'Bergen lokallag inviterer til høsttur i nærområdet. Perfekt mulighet for nye deltagere å bli kjent med vår måte å arbeide på.',
    image: 'https://via.placeholder.com/400x200/D32F2F/FFFFFF?text=H%C3%B8sttur+Bergen',
    readTime: '2 min',
    category: 'Lokallag',
  },
  {
    id: 4,
    title: 'Årsrapport 2024 er ute',
    date: '2025-11-01',
    excerpt: 'Vår årsrapport for 2024 viser imponerende resultater og vekst i alle våre kjerneområder.',
    image: 'https://via.placeholder.com/400x200/D32F2F/FFFFFF?text=%C3%85rsrapport',
    readTime: '4 min',
    category: 'Rapport',
  },
];

export default function NewsScreen() {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNewsPress = (newsItem) => {
    // In a real app, navigate to detailed news view
    console.log('News pressed:', newsItem.title);
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
                <Icon name="newspaper" size={32} color={theme.colors.white} />
              </View>
              <Text style={styles.headerTitle}>Nyheter</Text>
              <Text style={styles.headerSubtitle}>Hold deg oppdatert</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* News List */}
        {NEWS_ITEMS.map((news, index) => (
          <AnimatedCard key={news.id} delay={index * 100 + 200}>
            <TouchableOpacity
              style={styles.newsCard}
              onPress={() => handleNewsPress(news)}
              activeOpacity={0.9}
            >
              <View style={styles.newsImageContainer}>
                <Image
                  source={{ uri: news.image }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{news.category}</Text>
                </View>
              </View>

              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsExcerpt}>{news.excerpt}</Text>

                <View style={styles.newsMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={16} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{formatDate(news.date)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="time" size={16} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{news.readTime}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.newsArrow}>
                <Icon name="chevron-forward-outline" size={24} color={theme.colors.textLight} />
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {/* Load More Section */}
        <AnimatedCard delay={NEWS_ITEMS.length * 100 + 300}>
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity style={styles.loadMoreButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
                style={styles.loadMoreGradient}
              >
                <Icon name="refresh" size={24} color={theme.colors.primary} />
                <Text style={styles.loadMoreText}>Last flere nyheter</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    fontSize: 26,
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
  newsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  newsImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  newsContent: {
    padding: theme.spacing.lg,
  },
  newsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  newsExcerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginLeft: 4,
    fontSize: 12,
  },
  newsArrow: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: 160,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  loadMoreContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  loadMoreButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  loadMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  loadMoreText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
    fontSize: 16,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

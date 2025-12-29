import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';

const { width, height } = Dimensions.get('window');

// Category configurations with icons and colors
const CATEGORIES = {
  Alle: { icon: 'apps', color: theme.colors.primary },
  Samarbeid: { icon: 'handshake-outline', color: '#10B981' },
  Arrangement: { icon: 'calendar', color: '#F59E0B' },
  Lokallag: { icon: 'location', color: '#3B82F6' },
  Rapport: { icon: 'document-text', color: '#8B5CF6' },
  Frivillig: { icon: 'heart', color: '#EC4899' },
  Annet: { icon: 'ellipsis-horizontal', color: '#6B7280' },
};

export default function NewsScreen({ navigation }) {
  const { data, loading, refreshData } = useAppData();
  const news = data.news || [];
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;

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
      Animated.spring(headerScale, {
        toValue: 1,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get unique categories from news
  const categories = useMemo(() => {
    const uniqueCats = ['Alle', ...new Set(news.map(n => n.category).filter(Boolean))];
    return uniqueCats;
  }, [news]);

  // Filter news by category
  const filteredNews = useMemo(() => {
    if (selectedCategory === 'Alle') return news;
    return news.filter(n => n.category === selectedCategory);
  }, [news, selectedCategory]);

  // Get the featured (latest) news item
  const featuredNews = filteredNews[0];
  const regularNews = filteredNews.slice(1);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} uker siden`;
    return formatDate(dateString);
  };

  const handleNewsPress = (newsItem) => {
    navigation.navigate('NewsDetail', { newsItem });
  };

  const getCategoryConfig = (category) => {
    return CATEGORIES[category] || CATEGORIES.Annet;
  };

  // Animated card component
  const AnimatedNewsCard = ({ item, index, isFeatured = false }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(40)).current;
    const pressScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const delay = isFeatured ? 200 : index * 80 + 300;
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
    }, []);

    const handlePressIn = () => {
      Animated.spring(pressScale, {
        toValue: 0.97,
        ...theme.animations.springBouncy,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressScale, {
        toValue: 1,
        ...theme.animations.springBouncy,
        useNativeDriver: true,
      }).start();
    };

    const categoryConfig = getCategoryConfig(item.category);

    if (isFeatured) {
      return (
        <Animated.View
          style={[
            styles.featuredCard,
            {
              opacity: cardFade,
              transform: [{ translateY: cardSlide }, { scale: pressScale }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleNewsPress(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.featuredTouchable}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.featuredImage}
              >
                <Icon name="newspaper" size={80} color={theme.colors.white} style={{ opacity: 0.3 }} />
              </LinearGradient>
            )}
            
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
              locations={[0, 0.5, 1]}
              style={styles.featuredGradient}
            />
            
            {/* Category badge */}
            <View style={[styles.featuredBadge, { backgroundColor: categoryConfig.color }]}>
              <Icon name={categoryConfig.icon} size={12} color="#FFF" />
              <Text style={styles.featuredBadgeText}>{item.category}</Text>
            </View>
            
            {/* Featured label */}
            <View style={styles.featuredLabel}>
              <Icon name="star" size={12} color={theme.colors.warning} />
              <Text style={styles.featuredLabelText}>SISTE NYTT</Text>
            </View>
            
            {/* Content */}
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={3}>
                {item.title}
              </Text>
              {item.excerpt && (
                <Text style={styles.featuredExcerpt} numberOfLines={2}>
                  {item.excerpt}
                </Text>
              )}
              <View style={styles.featuredMeta}>
                <View style={styles.metaItem}>
                  <Icon name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featuredMetaText}>{formatRelativeDate(item.date)}</Text>
                </View>
                {item.readTime && (
                  <View style={styles.metaItem}>
                    <Icon name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featuredMetaText}>{item.readTime}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // Regular news card
    return (
      <Animated.View
        style={[
          styles.newsCard,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }, { scale: pressScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNewsPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.cardTouchable}
        >
          {item.image ? (
            <View style={styles.newsImageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.newsImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageGradient}
              />
            </View>
          ) : (
            <View style={[styles.newsImagePlaceholder, { backgroundColor: categoryConfig.color + '15' }]}>
              <Icon name={categoryConfig.icon} size={32} color={categoryConfig.color} />
            </View>
          )}
          
          <View style={styles.newsContent}>
            {item.category && (
              <View style={[styles.categoryPill, { backgroundColor: categoryConfig.color + '20' }]}>
                <Icon name={categoryConfig.icon} size={12} color={categoryConfig.color} />
                <Text style={[styles.categoryPillText, { color: categoryConfig.color }]}>
                  {item.category}
                </Text>
              </View>
            )}
            
            <Text style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            {item.excerpt && (
              <Text style={styles.newsExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>
            )}
            
            <View style={styles.newsMeta}>
              <Text style={styles.newsDate}>{formatRelativeDate(item.date)}</Text>
              {item.readTime && (
                <>
                  <View style={styles.metaDot} />
                  <Text style={styles.newsReadTime}>{item.readTime}</Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.cardArrow}>
            <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Category tab component
  const CategoryTab = ({ category, isSelected, onPress }) => {
    const config = getCategoryConfig(category);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePress = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          ...theme.animations.springBouncy,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...theme.animations.springBouncy,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[
            styles.categoryTab,
            isSelected && styles.categoryTabSelected,
          ]}
        >
          <Icon 
            name={config.icon} 
            size={16} 
            color={isSelected ? theme.colors.white : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.categoryTabText,
            isSelected && styles.categoryTabTextSelected,
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshData}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: headerScale }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.headerIconGradient}
              >
                <Icon name="newspaper" size={28} color={theme.colors.white} />
              </LinearGradient>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Nyheter</Text>
              <Text style={styles.headerSubtitle}>
                {news.length} {news.length === 1 ? 'artikkel' : 'artikler'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View
          style={[
            styles.categoryContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <CategoryTab
                key={category}
                category={category}
                isSelected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="newspaper-outline" size={48} color={theme.colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Ingen nyheter</Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'Alle' 
                ? 'Nye artikler vil vises her når de publiseres'
                : `Ingen nyheter i kategorien "${selectedCategory}"`}
            </Text>
            {selectedCategory !== 'Alle' && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setSelectedCategory('Alle')}
              >
                <Text style={styles.emptyButtonText}>Vis alle nyheter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Featured News */}
            {featuredNews && (
              <AnimatedNewsCard item={featuredNews} index={0} isFeatured />
            )}

            {/* Section Header for More News */}
            {regularNews.length > 0 && (
              <Animated.View 
                style={[
                  styles.sectionHeader,
                  { opacity: fadeAnim }
                ]}
              >
                <Text style={styles.sectionTitle}>Flere nyheter</Text>
                <View style={styles.sectionLine} />
              </Animated.View>
            )}

            {/* Regular News Grid */}
            {regularNews.map((item, index) => (
              <AnimatedNewsCard 
                key={item.id || index} 
                item={item} 
                index={index}
              />
            ))}
          </>
        )}

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
  
  // Header styles
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIconContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.glowSubtle,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Category Filter
  categoryContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryTabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryTabText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryTabTextSelected: {
    color: theme.colors.white,
    fontWeight: '600',
  },

  // Featured Card
  featuredCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  featuredTouchable: {
    width: '100%',
    height: 380,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  featuredBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  featuredLabel: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredLabelText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  featuredTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredExcerpt: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  featuredMetaText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },

  // Regular News Card
  newsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  cardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsImageContainer: {
    width: 110,
    height: 110,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  newsImagePlaceholder: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsContent: {
    flex: 1,
    padding: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.xs,
  },
  categoryPillText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  newsTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  newsExcerpt: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.xs,
  },
  newsReadTime: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  cardArrow: {
    paddingRight: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary,
  },
  emptyButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

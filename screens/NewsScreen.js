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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';

const { width } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
  const { data, loading, refreshData } = useAppData();
  const news = data.news || [];
  
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
        Animated.spring(cardSlide, {
          toValue: 0,
          delay,
          ...theme.animations.spring,
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleNewsPress = (newsItem) => {
    navigation.navigate('NewsDetail', { newsItem });
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.headerGradient}
          >
            <Icon name="newspaper" size={32} color={theme.colors.white} />
            <Text style={styles.headerTitle}>Nyheter</Text>
            <Text style={styles.headerSubtitle}>
              Siste nytt fra Medvandrerne
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* News List */}
        {news.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="newspaper-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Ingen nyheter ennå</Text>
            <Text style={styles.emptyText}>
              Nye artikler vil vises her når de publiseres
            </Text>
          </View>
        ) : (
          news.map((item, index) => (
            <AnimatedCard key={item.id || index} delay={index * 100 + 200}>
              <TouchableOpacity
                style={styles.newsCard}
                onPress={() => handleNewsPress(item)}
                activeOpacity={0.7}
              >
                {item.image ? (
                  <View style={styles.newsImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.newsImage}
                      resizeMode="cover"
                    />
                    {item.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.newsImagePlaceholder}>
                    <Icon name="newspaper" size={40} color={theme.colors.textTertiary} />
                  </View>
                )}
                
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.excerpt && (
                    <Text style={styles.newsExcerpt} numberOfLines={3}>
                      {item.excerpt}
                    </Text>
                  )}
                  
                  <View style={styles.newsMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    </View>
                    {item.readTime && (
                      <View style={styles.metaItem}>
                        <Icon name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>{item.readTime}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.newsArrow}>
                  <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          ))
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  newsImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  newsContent: {
    padding: theme.spacing.lg,
  },
  newsTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  newsExcerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  newsArrow: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    marginTop: -10,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

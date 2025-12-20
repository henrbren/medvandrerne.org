import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Share,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function NewsDetailScreen({ route, navigation }) {
  const { newsItem } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: theme.animations.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${newsItem.title}\n\n${newsItem.excerpt || ''}\n\nLes mer på Medvandrerne-appen`,
        title: newsItem.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        {newsItem.image ? (
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: newsItem.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            />
            {newsItem.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{newsItem.category}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.heroPlaceholder}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.heroPlaceholderGradient}
            >
              <Icon name="newspaper" size={64} color={theme.colors.white} />
            </LinearGradient>
          </View>
        )}

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Meta */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(newsItem.date)}</Text>
            </View>
            {newsItem.readTime && (
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{newsItem.readTime}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{newsItem.title}</Text>

          {/* Excerpt */}
          {newsItem.excerpt && (
            <Text style={styles.excerpt}>{newsItem.excerpt}</Text>
          )}

          {/* Full Content */}
          {newsItem.content && (
            <Text style={styles.bodyText}>{newsItem.content}</Text>
          )}

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon name="share-social" size={20} color={theme.colors.primary} />
            <Text style={styles.shareButtonText}>Del denne nyheten</Text>
          </TouchableOpacity>
        </Animated.View>

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
  heroContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
  },
  heroPlaceholderGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
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
  content: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -theme.spacing.xl,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    lineHeight: 36,
  },
  excerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xxl,
  },
  shareButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

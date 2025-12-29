import React, { useRef, useEffect, useState } from 'react';
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
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useAppData } from '../contexts/AppDataContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 320;

// Category configurations
const CATEGORIES = {
  Samarbeid: { icon: 'handshake-outline', color: '#10B981' },
  Arrangement: { icon: 'calendar', color: '#F59E0B' },
  Lokallag: { icon: 'location', color: '#3B82F6' },
  Rapport: { icon: 'document-text', color: '#8B5CF6' },
  Frivillig: { icon: 'heart', color: '#EC4899' },
  Annet: { icon: 'ellipsis-horizontal', color: '#6B7280' },
};

export default function NewsDetailScreen({ route, navigation }) {
  const { newsItem } = route.params;
  const { data } = useAppData();
  const allNews = data.news || [];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // Get related news (same category, excluding current)
  const relatedNews = allNews
    .filter(n => n.id !== newsItem.id && n.category === newsItem.category)
    .slice(0, 3);

  // Combine main image with gallery images
  const allImages = [
    ...(newsItem.image ? [newsItem.image] : []),
    ...(newsItem.gallery || []),
  ];

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

  const getCategoryConfig = (category) => {
    return CATEGORIES[category] || CATEGORIES.Annet;
  };

  const categoryConfig = getCategoryConfig(newsItem.category);

  // Parallax effect for header image
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  // Image Gallery Modal
  const ImageModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.modalClose}
          onPress={() => setImageModalVisible(false)}
        >
          <Icon name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <FlatList
          data={allImages}
          horizontal
          pagingEnabled
          initialScrollIndex={selectedImageIndex}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: item }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        
        {allImages.length > 1 && (
          <View style={styles.modalIndicator}>
            <Text style={styles.modalIndicatorText}>
              {selectedImageIndex + 1} / {allImages.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  // Related news card
  const RelatedNewsCard = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => navigation.push('NewsDetail', { newsItem: item })}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.relatedImage} resizeMode="cover" />
      ) : (
        <View style={[styles.relatedImagePlaceholder, { backgroundColor: getCategoryConfig(item.category).color + '20' }]}>
          <Icon name={getCategoryConfig(item.category).icon} size={20} color={getCategoryConfig(item.category).color} />
        </View>
      )}
      <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Parallax Header Image */}
      <Animated.View 
        style={[
          styles.headerImageContainer,
          {
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
          }
        ]}
      >
        {newsItem.image ? (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => openImageModal(0)}
          >
            <Image
              source={{ uri: newsItem.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <LinearGradient
            colors={[categoryConfig.color, theme.colors.primaryDark]}
            style={styles.heroImage}
          >
            <Icon name={categoryConfig.icon} size={80} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          locations={[0.3, 0.6, 1]}
          style={styles.heroGradient}
        />
        
        {/* Category Badge on Image */}
        {newsItem.category && (
          <View style={[styles.heroCategoryBadge, { backgroundColor: categoryConfig.color }]}>
            <Icon name={categoryConfig.icon} size={14} color="#FFF" />
            <Text style={styles.heroCategoryText}>{newsItem.category}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View style={{ height: HEADER_HEIGHT - 40 }} />

        {/* Content Card */}
        <Animated.View
          style={[
            styles.contentCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
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
            
            {/* Author info if available */}
            {newsItem.author && (
              <View style={styles.authorContainer}>
                {newsItem.authorImage ? (
                  <Image source={{ uri: newsItem.authorImage }} style={styles.authorImage} />
                ) : (
                  <View style={styles.authorImagePlaceholder}>
                    <Icon name="person" size={16} color={theme.colors.textSecondary} />
                  </View>
                )}
                <View>
                  <Text style={styles.authorLabel}>Skrevet av</Text>
                  <Text style={styles.authorName}>{newsItem.author}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{newsItem.title}</Text>

          {/* Excerpt/Lead */}
          {newsItem.excerpt && (
            <Text style={styles.excerpt}>{newsItem.excerpt}</Text>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Full Content */}
          {newsItem.content && (
            <Text style={styles.bodyText}>{newsItem.content}</Text>
          )}

          {/* Image Gallery */}
          {allImages.length > 1 && (
            <View style={styles.gallerySection}>
              <Text style={styles.gallerySectionTitle}>
                <Icon name="images" size={18} color={theme.colors.textSecondary} /> Bilder
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {allImages.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openImageModal(index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
                    {index === 0 && (
                      <View style={styles.mainImageBadge}>
                        <Text style={styles.mainImageBadgeText}>Hovedbilde</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tags if available */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsSectionTitle}>Tagger</Text>
              <View style={styles.tagsContainer}>
                {newsItem.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.shareButtonGradient}
              >
                <Icon name="share-social" size={20} color={theme.colors.white} />
                <Text style={styles.shareButtonText}>Del denne nyheten</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.relatedSectionTitle}>Relaterte nyheter</Text>
                <View style={styles.relatedLine} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedNews.map((item) => (
                  <RelatedNewsCard key={item.id} item={item} />
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      <ImageModal />
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
  
  // Header/Hero Image
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 60,
    left: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  heroCategoryText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },

  // Content Card
  contentCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    minHeight: height - HEADER_HEIGHT + 100,
  },

  // Meta
  metaContainer: {
    marginBottom: theme.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorLabel: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  authorName: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },

  // Title
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 38,
  },

  // Excerpt
  excerpt: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },

  // Body
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 28,
    letterSpacing: 0.2,
  },

  // Gallery
  gallerySection: {
    marginTop: theme.spacing.xl,
  },
  gallerySectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  galleryScroll: {
    gap: theme.spacing.md,
  },
  galleryImage: {
    width: 160,
    height: 120,
    borderRadius: theme.borderRadius.lg,
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  mainImageBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '600',
  },

  // Tags
  tagsSection: {
    marginTop: theme.spacing.xl,
  },
  tagsSectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.backgroundElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  // Action Buttons
  actionButtons: {
    marginTop: theme.spacing.xxl,
  },
  shareButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  shareButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },

  // Related News
  relatedSection: {
    marginTop: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  relatedSectionTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  relatedLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  relatedScroll: {
    gap: theme.spacing.md,
  },
  relatedCard: {
    width: 150,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 90,
  },
  relatedImagePlaceholder: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedTitle: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    padding: theme.spacing.sm,
    lineHeight: 18,
  },

  // Image Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width - 40,
    height: height * 0.7,
  },
  modalIndicator: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  modalIndicatorText: {
    ...theme.typography.caption,
    color: theme.colors.white,
  },

  bottomSpacer: {
    height: theme.spacing.xxl,
  },
});

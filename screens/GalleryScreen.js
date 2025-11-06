import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// Sample gallery data
const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Femundløpet 2024',
    description: 'En fantastisk uke med fellesskap og mestring',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=Femundl%C3%B8pet+2024',
    category: 'Arrangement',
    date: '2024-02',
  },
  {
    id: 2,
    title: 'Lokallag Bergen',
    description: 'Høsttur i vakre omgivelser',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=Bergen+Tur',
    category: 'Lokallag',
    date: '2024-10',
  },
  {
    id: 3,
    title: 'Miljøaksjon',
    description: 'Rydding av Alnaelva',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=Milj%C3%B8aksjon',
    category: 'Miljø',
    date: '2024-09',
  },
  {
    id: 4,
    title: 'Fjellbris 2024',
    description: 'Motivasjonstur på fjellet',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=Fjellbris',
    category: 'Motivasjonstur',
    date: '2024-04',
  },
  {
    id: 5,
    title: 'Styre og administrasjon',
    description: 'Årsmøte og strategidager',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=%C3%85rsm%C3%B8te',
    category: 'Organisasjon',
    date: '2024-03',
  },
  {
    id: 6,
    title: 'Ungdomsgruppe',
    description: 'Nye deltagere på tur',
    image: 'https://via.placeholder.com/400x300/D32F2F/FFFFFF?text=Ungdomsgruppe',
    category: 'Deltagere',
    date: '2024-08',
  },
];

const CATEGORIES = ['Alle', 'Arrangement', 'Lokallag', 'Miljø', 'Motivasjonstur', 'Organisasjon', 'Deltagere'];

export default function GalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const filteredItems = selectedCategory === 'Alle'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  const handleImagePress = (item) => {
    setSelectedImage(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
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
                <Icon name="images" size={32} color={theme.colors.white} />
              </View>
              <Text style={styles.headerTitle}>Galleri</Text>
              <Text style={styles.headerSubtitle}>Våre øyeblikk</Text>
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

        {/* Gallery Grid */}
        <View style={styles.galleryContainer}>
          {filteredItems.map((item, index) => (
            <AnimatedCard
              key={item.id}
              delay={index * 50 + 200}
              style={styles.galleryItem}
            >
              <TouchableOpacity
                style={styles.imageCard}
                onPress={() => handleImagePress(item)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageTitle}>{item.title}</Text>
                    <Text style={styles.imageCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.expandIcon}>
                    <Icon name="expand" size={20} color={theme.colors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </View>

        {/* Stats Section */}
        <AnimatedCard delay={filteredItems.length * 50 + 300}>
          <View style={styles.statsSection}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.secondary + '10']}
              style={styles.statsGradient}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50+</Text>
                  <Text style={styles.statLabel}>Turer</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>200+</Text>
                  <Text style={styles.statLabel}>Deltagere</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>9</Text>
                  <Text style={styles.statLabel}>Lokallag</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </AnimatedCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <>
                  <Image
                    source={{ uri: selectedImage.image }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                    <Text style={styles.modalDescription}>{selectedImage.description}</Text>
                    <View style={styles.modalMeta}>
                      <Text style={styles.modalCategory}>{selectedImage.category}</Text>
                      <Text style={styles.modalDate}>{selectedImage.date}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
  },
  galleryItem: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  imageCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  galleryImage: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  imageInfo: {
    flex: 1,
  },
  imageTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  imageCategory: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  expandIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  statsGradient: {
    padding: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.lg,
  },
  modalInfo: {
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  modalDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCategory: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
});

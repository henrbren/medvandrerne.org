import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { getLevelColors, getLevelAnimationConfig } from '../../utils/journeyUtils';
import { API_BASE_URL } from '../../services/api';

// Haptic feedback based on level
const playLevelHaptics = async (level) => {
  if (Platform.OS === 'web') return;
  
  const safeLevel = Math.min(Math.max(level || 1, 1), 15);
  
  // Base impact
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  // Additional haptics based on level (more dunks for higher levels)
  const extraDunks = Math.floor(safeLevel / 3); // 0 dunks for 1-2, 1 for 3-5, 2 for 6-8, etc.
  
  for (let i = 0; i < extraDunks; i++) {
    await new Promise(resolve => setTimeout(resolve, 80 - (safeLevel * 3))); // Faster spacing for higher levels
    await Haptics.impactAsync(
      safeLevel >= 10 ? Haptics.ImpactFeedbackStyle.Heavy :
      safeLevel >= 5 ? Haptics.ImpactFeedbackStyle.Medium :
      Haptics.ImpactFeedbackStyle.Light
    );
  }
  
  // Final flourish for high levels
  if (safeLevel >= 8) {
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

// Dark map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// QR Code component for contact sharing
const ContactQRCode = ({ contact, size = 120 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const qrData = JSON.stringify({
    type: 'medvandrer',
    id: contact.userId || contact.id,
    name: contact.name || '',
    phone: contact.phone,
    email: contact.email || null,
    avatarUrl: contact.avatarUrl || contact.image || null,
    level: contact.level || 1,
    levelName: contact.levelName || 'Nybegynner',
    totalPoints: contact.totalPoints || 0,
    completedActivities: contact.completedActivities || 0,
  });
  
  const encodedData = encodeURIComponent(qrData);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&bgcolor=FFFFFF&color=1A1A2E`;
  
  return (
    <View style={{ width: size, height: size, backgroundColor: theme.colors.white, borderRadius: 8, overflow: 'hidden' }}>
      {loading && !error && (
        <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      {error ? (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="qr-code" size={40} color={theme.colors.textTertiary} />
        </View>
      ) : (
        <Image
          source={{ uri: qrUrl }}
          style={{ width: size, height: size }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

// Animated background lines component
const AnimatedBackground = ({ level }) => {
  const colors = getLevelColors(level || 1);
  const animConfig = getLevelAnimationConfig(level || 1);
  
  // Create multiple animated values for different lines
  const lineAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateX: new Animated.Value(-SCREEN_WIDTH),
      opacity: new Animated.Value(0),
    }))
  ).current;
  
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate each line with staggered timing
    const lineAnimations = lineAnims.map((anim, index) => {
      const delay = index * 150;
      const duration = 2000 + (index * 300); // Faster animations
      
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.translateX, {
              toValue: SCREEN_WIDTH * 2,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 1, // Full opacity for more visibility
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: duration * 0.7,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(anim.translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    // Glow animation for higher levels
    const glowAnimation = animConfig.glow ? Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ) : null;
    
    Animated.parallel([...lineAnimations, glowAnimation].filter(Boolean)).start();
    
    return () => {
      lineAnims.forEach(anim => {
        anim.translateX.stopAnimation();
        anim.opacity.stopAnimation();
      });
      glowAnim.stopAnimation();
    };
  }, [level]);
  
  // Line configurations - different angles and positions
  const lineConfigs = [
    { top: '10%', angle: -15, width: SCREEN_WIDTH * 1.5, height: 2 },
    { top: '20%', angle: 10, width: SCREEN_WIDTH * 1.8, height: 3 },
    { top: '35%', angle: -8, width: SCREEN_WIDTH * 1.6, height: 1.5 },
    { top: '45%', angle: 12, width: SCREEN_WIDTH * 2, height: 2.5 },
    { top: '60%', angle: -5, width: SCREEN_WIDTH * 1.7, height: 2 },
    { top: '70%', angle: 8, width: SCREEN_WIDTH * 1.4, height: 1 },
    { top: '80%', angle: -12, width: SCREEN_WIDTH * 1.9, height: 3 },
    { top: '90%', angle: 5, width: SCREEN_WIDTH * 1.5, height: 2 },
  ];
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Background glow for higher levels */}
      {animConfig.glow && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.glow,
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      
      {/* Animated lines */}
      {lineAnims.map((anim, index) => {
        const config = lineConfigs[index];
        return (
          <Animated.View
            key={index}
            style={[
              styles.animatedLine,
              {
                top: config.top,
                width: config.width,
                height: config.height * 2, // Make lines thicker
                transform: [
                  { translateX: anim.translateX },
                  { rotate: `${config.angle}deg` },
                ],
                opacity: anim.opacity,
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                colors.primary + '60',
                colors.secondary + 'CC',
                colors.primary + '60',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        );
      })}
      
      {/* Extra particles for epic levels */}
      {animConfig.epic && (
        <View style={styles.particlesContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                  backgroundColor: colors.glow,
                  opacity: 0.3,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function ContactDetailModal({ visible, onClose, contact, onRemove, onContactUpdated }) {
  const [enrichedContact, setEnrichedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const imageScaleAnim = useRef(new Animated.Value(0)).current;
  
  // Fetch fresh user data from backend when modal opens
  useEffect(() => {
    if (visible && contact?.phone) {
      fetchUserData();
      // Play haptics based on contact's level
      playLevelHaptics(contact?.level || 1);
    } else if (!visible) {
      setEnrichedContact(null);
    }
  }, [visible, contact?.phone]);
  
  const fetchUserData = async () => {
    if (!contact?.phone) return;
    
    setLoading(true);
    try {
      // Normalize phone number - ensure +47 prefix
      let phone = contact.phone.replace(/\s+/g, '');
      if (!phone.startsWith('+')) {
        phone = '+47' + phone.replace(/^0/, '');
      }
      
      console.log('ContactDetailModal - looking up phone:', phone);
      
      const response = await fetch(`${API_BASE_URL}/users/lookup.php?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({ phoneNumbers: [phone] }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('ContactDetailModal - lookup response:', data);
        
        if (data.users && data.users.length > 0) {
          const backendUser = data.users[0];
          console.log('ContactDetailModal - fetched backend user:', backendUser);
          
          // Merge backend data with contact data
          const merged = {
            ...contact,
            ...backendUser,
            // Keep contact's addedAt
            addedAt: contact.addedAt,
          };
          setEnrichedContact(merged);
          
          // Notify parent to update contact in storage
          if (onContactUpdated) {
            onContactUpdated({
              ...contact,
              avatarUrl: backendUser.avatarUrl,
              level: backendUser.level,
              levelName: backendUser.levelName,
              totalPoints: backendUser.totalPoints,
              completedActivities: backendUser.completedActivities,
            });
          }
        } else {
          console.log('ContactDetailModal - no user found for phone:', phone);
        }
      } else {
        console.log('ContactDetailModal - lookup failed:', response.status);
      }
    } catch (error) {
      console.log('ContactDetailModal - failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!contact) return null;
  
  // Use enriched data if available, fallback to original contact
  const displayContact = enrichedContact || contact;
  
  const level = displayContact.level || 1;
  const colors = getLevelColors(level);

  const handleCall = () => {
    if (!displayContact.phone) {
      Alert.alert('Ingen telefon', 'Denne kontakten har ikke delt telefonnummer.');
      return;
    }
    Linking.openURL(`tel:${displayContact.phone}`);
  };

  const handleSMS = () => {
    if (!displayContact.phone) {
      Alert.alert('Ingen telefon', 'Denne kontakten har ikke delt telefonnummer.');
      return;
    }
    Linking.openURL(`sms:${displayContact.phone}`);
  };

  const handleEmail = () => {
    if (!displayContact.email) {
      Alert.alert('Ingen e-post', 'Denne kontakten har ikke delt e-postadresse.');
      return;
    }
    Linking.openURL(`mailto:${displayContact.email}`);
  };

  const handleRemove = () => {
    Alert.alert(
      'Fjern kontakt',
      `Er du sikker på at du vil fjerne ${displayContact.name || 'denne medvandreren'} fra listen?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Fjern', 
          style: 'destructive',
          onPress: () => {
            onRemove(contact); // Use original contact for removal
            onClose();
          }
        },
      ]
    );
  };

  // Get valid image URL
  const getImageUrl = () => {
    const imageUrl = displayContact?.avatarUrl || displayContact?.image || displayContact?.coordinatorImage;
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0 && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return null;
  };

  // Handle image preview
  const handleOpenImagePreview = () => {
    const imageUrl = getImageUrl();
    if (!imageUrl) return;
    
    setImagePreviewVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate in
    imageScaleAnim.setValue(0);
    Animated.spring(imageScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseImagePreview = () => {
    Animated.timing(imageScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setImagePreviewVisible(false);
    });
  };

  // Format member since date
  const getMemberSince = () => {
    if (!displayContact.memberSince) return null;
    const date = new Date(displayContact.memberSince);
    if (date.getFullYear() < 2000) return null;
    return date.toLocaleDateString('nb-NO', {
      month: 'long',
      year: 'numeric',
    });
  };

  const memberSince = getMemberSince();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Animated Background Lines */}
        <AnimatedBackground level={level} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Kontakt</Text>
          <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
            <Icon name="trash-outline" size={22} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Kontaktkort - License Card Style */}
        <View style={styles.kontaktkortWrapper}>
          <TouchableOpacity 
            onPress={handleOpenImagePreview}
            disabled={!getImageUrl()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary || colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.kontaktkort}
            >
              {/* Header */}
              <View style={styles.kontaktkortHeader}>
                <View style={styles.kontaktkortLogo}>
                  <Icon name="people" size={20} color={theme.colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kontaktkortTitle}>MEDVANDRERNE</Text>
                  <Text style={styles.kontaktkortSubtitle}>Kontaktkort</Text>
                </View>
                {getImageUrl() && (
                  <View style={styles.kontaktkortZoomHint}>
                    <Icon name="resize-outline" size={16} color="rgba(255,255,255,0.8)" />
                  </View>
                )}
              </View>

              {/* Main Content */}
              <View style={styles.kontaktkortContent}>
                <View style={styles.kontaktkortAvatar}>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (() => {
                    const imageUrl = getImageUrl();
                    if (imageUrl) {
                      return <Image source={{ uri: imageUrl }} style={styles.kontaktkortAvatarImage} />;
                    }
                    return (
                      <Text style={styles.kontaktkortAvatarText}>
                        {(displayContact.name || 'M').charAt(0).toUpperCase()}
                      </Text>
                    );
                  })()}
                </View>
                <View style={styles.kontaktkortInfo}>
                  <Text style={styles.kontaktkortName} numberOfLines={1}>
                    {displayContact.name || 'Medvandrer'}
                  </Text>
                  <View style={styles.kontaktkortLevel}>
                    <Icon name="shield-checkmark" size={14} color={theme.colors.white} />
                    <Text style={styles.kontaktkortLevelText}>
                      Nivå {displayContact.level || 1}: {displayContact.levelName || 'Nybegynner'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.kontaktkortStats}>
                <View style={styles.kontaktkortStat}>
                  <Text style={styles.kontaktkortStatValue}>
                    {(displayContact.totalPoints || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.kontaktkortStatLabel}>XP</Text>
                </View>
                <View style={styles.kontaktkortStatDivider} />
                <View style={styles.kontaktkortStat}>
                  <Text style={styles.kontaktkortStatValue}>
                    {displayContact.completedActivities || 0}
                  </Text>
                  <Text style={styles.kontaktkortStatLabel}>Aktiviteter</Text>
                </View>
                <View style={styles.kontaktkortStatDivider} />
                <View style={styles.kontaktkortStat}>
                  <Text style={styles.kontaktkortStatValue}>
                    {displayContact.completedExpeditions || 0}
                  </Text>
                  <Text style={styles.kontaktkortStatLabel}>Ekspedisjoner</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.kontaktkortFooter}>
                <Text style={styles.kontaktkortDate}>
                  {memberSince ? `Medlem siden ${memberSince}` : 'Medvandrer'}
                </Text>
                {displayContact.userId && (
                  <Text style={styles.kontaktkortId}>
                    {displayContact.userId.slice(-8).toUpperCase()}
                  </Text>
                )}
              </View>

              {/* Tap hint */}
              {getImageUrl() && (
                <View style={styles.kontaktkortTapHint}>
                  <Text style={styles.kontaktkortTapHintText}>Trykk for å se profilbilde</Text>
                </View>
              )}

              {/* Holographic Effect */}
              <View style={styles.holographicOverlay} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Kontaktinfo</Text>
          
          {/* Phone */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="call" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>
                {contact.phone || 'Ikke delt'}
              </Text>
            </View>
            {contact.phone && (
              <View style={styles.infoActions}>
                <TouchableOpacity style={styles.infoActionButton} onPress={handleCall}>
                  <Icon name="call" size={18} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoActionButton} onPress={handleSMS}>
                  <Icon name="chatbubble-outline" size={18} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="mail" size={20} color={theme.colors.info} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>E-post</Text>
              <Text style={styles.infoValue}>
                {contact.email || 'Ikke delt'}
              </Text>
            </View>
            {contact.email && (
              <View style={styles.infoActions}>
                <TouchableOpacity style={[styles.infoActionButton, { backgroundColor: theme.colors.info }]} onPress={handleEmail}>
                  <Icon name="mail" size={18} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Location Map */}
        {displayContact.location?.sharing && displayContact.location?.latitude && displayContact.location?.longitude && (
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Icon name="location" size={18} color={theme.colors.success} />
              <Text style={styles.sectionTitle}>Deler posisjon</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={{
                  latitude: displayContact.location.latitude,
                  longitude: displayContact.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                customMapStyle={darkMapStyle}
              >
                <Marker
                  coordinate={{
                    latitude: displayContact.location.latitude,
                    longitude: displayContact.location.longitude,
                  }}
                >
                  <View style={styles.markerContainer}>
                    <View style={[styles.markerAvatar, { borderColor: colors.primary }]}>
                      {(displayContact.avatarUrl || displayContact.image) ? (
                        <Image 
                          source={{ uri: displayContact.avatarUrl || displayContact.image }} 
                          style={styles.markerAvatarImage} 
                        />
                      ) : (
                        <Text style={styles.markerAvatarText}>
                          {(displayContact.name || 'M').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.markerPointer, { borderTopColor: colors.primary }]} />
                  </View>
                </Marker>
              </MapView>
              {displayContact.location.updatedAt && (
                <View style={styles.locationTimestamp}>
                  <Icon name="time-outline" size={12} color={theme.colors.textTertiary} />
                  <Text style={styles.locationTimestampText}>
                    Oppdatert {new Date(displayContact.location.updatedAt).toLocaleTimeString('nb-NO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Share QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Del kontakt</Text>
          <View style={styles.qrCard}>
            <ContactQRCode contact={displayContact} size={140} />
            <Text style={styles.qrHint}>
              Scan koden med Medvandrerne-appen for å legge til {displayContact.name?.split(' ')[0] || 'kontakten'}
            </Text>
          </View>
        </View>

        {/* Added Date */}
        <View style={styles.addedSection}>
          <Icon name="calendar-outline" size={16} color={theme.colors.textTertiary} />
          <Text style={styles.addedText}>
            Lagt til {new Date(contact.addedAt).toLocaleDateString('nb-NO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        
        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImagePreview}
      >
        <TouchableOpacity 
          style={styles.imagePreviewOverlay} 
          activeOpacity={1} 
          onPress={handleCloseImagePreview}
        >
          <Animated.View style={[
            styles.imagePreviewContainer,
            {
              transform: [
                { scale: imageScaleAnim },
              ],
              opacity: imageScaleAnim,
            }
          ]}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.imagePreviewClose}
              onPress={handleCloseImagePreview}
            >
              <Icon name="close-circle" size={36} color={theme.colors.white} />
            </TouchableOpacity>
            
            {/* Image */}
            {getImageUrl() && (
              <Image 
                source={{ uri: getImageUrl() }} 
                style={styles.imagePreviewImage}
                resizeMode="contain"
              />
            )}
            
            {/* Name and level */}
            <View style={styles.imagePreviewInfo}>
              <Text style={styles.imagePreviewName}>
                {displayContact.name || 'Medvandrer'}
              </Text>
              <View style={[styles.imagePreviewBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.imagePreviewLevel}>
                  Nivå {displayContact.level || 1}
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  
  // Kontaktkort styles (license card style)
  kontaktkortWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  kontaktkort: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    minHeight: 200,
  },
  kontaktkortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  kontaktkortLogo: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kontaktkortTitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 10,
  },
  kontaktkortSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 11,
  },
  kontaktkortZoomHint: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.md,
  },
  kontaktkortContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  kontaktkortAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kontaktkortAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  kontaktkortAvatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 28,
  },
  kontaktkortInfo: {
    flex: 1,
  },
  kontaktkortName: {
    ...theme.typography.h2,
    color: theme.colors.white,
    fontSize: 18,
  },
  kontaktkortLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  kontaktkortLevelText: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: 13,
  },
  kontaktkortStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  kontaktkortStat: {
    alignItems: 'center',
    flex: 1,
  },
  kontaktkortStatValue: {
    ...theme.typography.title,
    color: theme.colors.white,
    fontSize: 16,
  },
  kontaktkortStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  kontaktkortStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  kontaktkortFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  kontaktkortDate: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.8,
    fontSize: 10,
  },
  kontaktkortId: {
    ...theme.typography.caption,
    color: theme.colors.white,
    opacity: 0.6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  kontaktkortTapHint: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  kontaktkortTapHintText: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  holographicOverlay: {
    position: 'absolute',
    top: 0,
    right: -50,
    width: 150,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '15deg' }],
  },

  // Legacy styles (kept for compatibility)
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
    borderRadius: 56, // 50 + 6 for border
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 40,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  levelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsSection: {
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statValueSmall: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  infoActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  infoActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // QR Code section
  qrSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  qrCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  qrHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  
  addedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
  },
  addedText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  // Location Map styles
  locationSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  liveText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: 10,
  },
  mapContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  map: {
    height: 180,
    width: '100%',
  },
  locationTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundElevated,
  },
  locationTimestampText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  markerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  markerAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.primary,
    marginTop: -1,
  },
  // Animated background styles
  animatedLine: {
    position: 'absolute',
    left: -100,
    overflow: 'hidden',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Avatar zoom hint
  avatarZoomHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Image preview modal styles
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  imagePreviewImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width - 40,
    borderRadius: 20,
  },
  imagePreviewInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  imagePreviewName: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  imagePreviewBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  imagePreviewLevel: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});

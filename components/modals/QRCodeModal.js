import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Share,
  Animated,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Icon from '../Icon';
import { theme } from '../../constants/theme';
import { getLevelName, getLevelColors, getLevelAnimationConfig } from '../../utils/journeyUtils';

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.55, 220);

// Animated background lines component
const AnimatedBackground = ({ level }) => {
  const colors = getLevelColors(level || 1);
  const animConfig = getLevelAnimationConfig(level || 1);
  
  const lineAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateX: new Animated.Value(-SCREEN_WIDTH),
      opacity: new Animated.Value(0),
    }))
  ).current;
  
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const lineAnimations = lineAnims.map((anim, index) => {
      const delay = index * 150;
      const duration = 2000 + (index * 300);
      
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
                toValue: 1,
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
    
    lineAnimations.forEach(anim => anim.start());
    if (glowAnimation) glowAnimation.start();
    
    return () => {
      lineAnimations.forEach(anim => anim.stop());
      if (glowAnimation) glowAnimation.stop();
    };
  }, [level]);
  
  const lineConfigs = [
    { top: '8%', width: SCREEN_WIDTH * 1.5, height: 2, angle: -8 },
    { top: '15%', width: SCREEN_WIDTH * 1.3, height: 3, angle: 5 },
    { top: '25%', width: SCREEN_WIDTH * 1.4, height: 2, angle: -3 },
    { top: '45%', width: SCREEN_WIDTH * 1.6, height: 4, angle: 7 },
    { top: '55%', width: SCREEN_WIDTH * 1.2, height: 2, angle: -6 },
    { top: '70%', width: SCREEN_WIDTH * 1.5, height: 3, angle: 4 },
    { top: '82%', width: SCREEN_WIDTH * 1.3, height: 2, angle: -5 },
    { top: '92%', width: SCREEN_WIDTH * 1.4, height: 3, angle: 8 },
  ];
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {animConfig.glow && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.glow, opacity: glowOpacity },
          ]}
        />
      )}
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
                height: config.height * 2,
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
    </View>
  );
};

// QR Code component using Google Charts API as fallback
const QRCodeImage = ({ value, size }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  if (!value || value.length === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white }}>
        <Icon name="warning" size={32} color={theme.colors.error} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          Ingen data
        </Text>
      </View>
    );
  }

  const encodedData = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&bgcolor=FFFFFF&color=1A1A2E`;
  
  return (
    <View style={{ width: size, height: size, backgroundColor: theme.colors.white }}>
      {loading && !error && (
        <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      {error ? (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="qr-code" size={64} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', fontSize: 12 }}>
            Kunne ikke laste QR-kode
          </Text>
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

export default function QRCodeModal({ visible, onClose, user, localStats, onScanSuccess, initialMode = 'show' }) {
  const [mode, setMode] = useState(initialMode);
  
  // Use highest level between server and local
  const displayLevel = Math.max(user?.level || 1, localStats?.level || 1);
  const displayLevelName = getLevelName(displayLevel);
  const displayPoints = Math.max(user?.totalPoints || 0, localStats?.totalPoints || 0);
  const displayActivities = Math.max(user?.completedActivities || 0, localStats?.completedActivities || 0);
  const levelColors = getLevelColors(displayLevel);
  
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      // Play haptics based on user's level
      playLevelHaptics(displayLevel);
    }
  }, [visible, initialMode, displayLevel]);
  
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (mode === 'scan') {
      requestCameraPermission();
    }
  }, [mode]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Kamera tilgang',
        'Vi trenger tilgang til kameraet for å scanne QR-koder.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const contactData = JSON.parse(data);
      
      if (!contactData.type || contactData.type !== 'medvandrer') {
        Alert.alert('Ugyldig kode', 'Dette er ikke en gyldig Medvandrerkode.');
        setScanned(false);
        return;
      }

      if (contactData.id === user?.id) {
        Alert.alert('Oops!', 'Du kan ikke legge til deg selv som kontakt.');
        setScanned(false);
        return;
      }

      onScanSuccess(contactData);
      setScanned(false);
      setMode('show');
      onClose();
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke lese QR-koden. Prøv igjen.');
      setScanned(false);
    }
  };

  const handleShare = async () => {
    if (!user) return;
    
    try {
      await Share.share({
        message: `Scan min Medvandrerkode for å legge meg til som kontakt!\n\nNavn: ${user.name || 'Medvandrer'}\n\n(Åpne Medvandrerne-appen og gå til Profil > Scan kode)`,
        title: 'Min Medvandrerkode',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generateQRData = () => {
    if (!user) {
      return 'no-user';
    }
    
    const data = {
      type: 'medvandrer',
      id: user.id,
      name: user.name || '',
      phone: user.phone,
      email: user.email || null,
      avatarUrl: user.avatarUrl || null,
      level: displayLevel,
      levelName: displayLevelName,
      totalPoints: displayPoints,
      completedActivities: displayActivities,
      memberSince: user.memberSince || user.createdAt || null,
    };
    
    return JSON.stringify(data);
  };

  const handleClose = () => {
    setMode('show');
    setScanned(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Animated Background */}
        <AnimatedBackground level={displayLevel} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Medvandrerkode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'show' && styles.modeButtonActive]}
            onPress={() => setMode('show')}
          >
            <Icon 
              name="qr-code-outline" 
              size={20} 
              color={mode === 'show' ? theme.colors.white : theme.colors.text} 
            />
            <Text style={[styles.modeButtonText, mode === 'show' && styles.modeButtonTextActive]}>
              Min kode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
            onPress={() => setMode('scan')}
          >
            <Icon 
              name="scan-outline" 
              size={20} 
              color={mode === 'scan' ? theme.colors.white : theme.colors.text} 
            />
            <Text style={[styles.modeButtonText, mode === 'scan' && styles.modeButtonTextActive]}>
              Scan kode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {mode === 'show' ? (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.showContainer, { opacity: fadeAnim }]}>
                {/* Avatar & Name Section */}
                <View style={styles.profileSection}>
                  <View style={[styles.avatarRing, { borderColor: levelColors.primary }]}>
                    {user?.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: levelColors.primary }]}>
                        <Text style={styles.avatarText}>
                          {(user?.name || 'M').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userName}>{user?.name || 'Medvandrer'}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelColors.primary + '20', borderColor: levelColors.primary + '40' }]}>
                    <Icon name="shield-checkmark" size={14} color={levelColors.primary} />
                    <Text style={[styles.levelText, { color: levelColors.primary }]}>
                      Nivå {displayLevel} • {displayLevelName}
                    </Text>
                  </View>
                </View>

                {/* QR Code */}
                <View style={styles.qrContainer}>
                  <View style={[styles.qrCard, { borderColor: levelColors.primary + '30' }]}>
                    {user ? (
                      <QRCodeImage
                        value={generateQRData()}
                        size={QR_SIZE}
                      />
                    ) : (
                      <View style={{ width: QR_SIZE, height: QR_SIZE, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="qr-code" size={64} color={theme.colors.textTertiary} />
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>Logg inn for å se koden</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayPoints}</Text>
                    <Text style={styles.statLabel}>Poeng</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{displayActivities}</Text>
                    <Text style={styles.statLabel}>Aktiviteter</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: levelColors.primary }]} 
                    onPress={handleShare}
                  >
                    <Icon name="share-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Del kode</Text>
                  </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                  <Icon name="information-circle" size={18} color={theme.colors.textTertiary} />
                  <Text style={styles.instructionsText}>
                    La andre scanne denne koden for å legge deg til i deres Flokken-liste
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>
          ) : (
            <View style={styles.scanContainer}>
              {hasPermission === false ? (
                <View style={styles.noPermission}>
                  <Icon name="camera-off" size={64} color={theme.colors.textTertiary} />
                  <Text style={styles.noPermissionText}>
                    Kamera tilgang er ikke gitt
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={requestCameraPermission}
                  >
                    <Text style={styles.retryButtonText}>Prøv igjen</Text>
                  </TouchableOpacity>
                </View>
              ) : hasPermission === null ? (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Starter kamera...</Text>
                </View>
              ) : (
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  />
                  <View style={styles.scanOverlay}>
                    <View style={styles.scanFrame}>
                      <View style={[styles.corner, styles.cornerTL]} />
                      <View style={[styles.corner, styles.cornerTR]} />
                      <View style={[styles.corner, styles.cornerBL]} />
                      <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                  </View>
                  <Text style={styles.scanHint}>
                    Hold kameraet over en Medvandrerkode
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  modeButtonTextActive: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  showContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    padding: 3,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  avatarPlaceholder: {
    width: 98,
    height: 98,
    borderRadius: 49,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
    fontSize: 40,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  levelText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    ...theme.shadows.large,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
  actionButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  instructionsText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
  scanContainer: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    ...theme.typography.body,
    color: theme.colors.white,
    textAlign: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  noPermission: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  noPermissionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  animatedLine: {
    position: 'absolute',
    left: -100,
    overflow: 'hidden',
  },
});

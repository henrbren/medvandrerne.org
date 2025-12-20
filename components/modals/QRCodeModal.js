import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../Icon';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.6, 250);

export default function QRCodeModal({ visible, onClose, user, onScanSuccess, initialMode = 'show' }) {
  const [mode, setMode] = useState(initialMode); // 'show' or 'scan'
  
  // Reset mode when modal opens
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
    }
  }, [visible, initialMode]);
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
      
      // Validate that it's a Medvandrerne QR code
      if (!contactData.type || contactData.type !== 'medvandrer') {
        Alert.alert('Ugyldig kode', 'Dette er ikke en gyldig Medvandrerkode.');
        setScanned(false);
        return;
      }

      // Check if trying to add yourself
      if (contactData.id === user?.id) {
        Alert.alert('Oops!', 'Du kan ikke legge til deg selv som kontakt.');
        setScanned(false);
        return;
      }

      // Pass data to parent
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
    
    const qrData = generateQRData();
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
    if (!user) return '';
    
    const data = {
      type: 'medvandrer',
      id: user.id,
      name: user.name || '',
      phone: user.phone,
      avatarUrl: user.avatarUrl || null,
      level: user.level || 1,
      levelName: user.levelName || 'Nybegynner',
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
              name="qr-code" 
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
              name="scan" 
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
            <Animated.View style={[styles.showContainer, { opacity: fadeAnim }]}>
              {/* QR Code */}
              <View style={styles.qrContainer}>
                <View style={styles.qrCard}>
                  <QRCode
                    value={generateQRData()}
                    size={QR_SIZE}
                    backgroundColor={theme.colors.white}
                    color={theme.colors.text}
                  />
                </View>
                <View style={styles.qrInfo}>
                  <Text style={styles.qrName}>{user?.name || 'Medvandrer'}</Text>
                  <View style={styles.qrLevel}>
                    <Icon name="shield-checkmark" size={16} color={theme.colors.primary} />
                    <Text style={styles.qrLevelText}>
                      Nivå {user?.level || 1} • {user?.levelName || 'Nybegynner'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructions}>
                <Icon name="information-circle" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.instructionsText}>
                  La andre scanne denne koden for å legge deg til som kontakt i deres Flokken-liste.
                </Text>
              </View>

              {/* Share Button */}
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Icon name="share-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.shareButtonText}>Del kode</Text>
              </TouchableOpacity>
            </Animated.View>
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
  showContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  qrCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
  },
  qrInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  qrName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  qrLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  qrLevelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xxl,
    marginHorizontal: theme.spacing.lg,
  },
  instructionsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  shareButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
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
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});

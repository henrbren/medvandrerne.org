import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Icon from '../components/Icon';
import { theme } from '../constants/theme';
import { useContacts } from '../hooks/useContacts';
import { useLocationSharing } from '../hooks/useLocationSharing';
import ContactDetailModal from '../components/modals/ContactDetailModal';

const { width, height } = Dimensions.get('window');

// Default region (Oslo, Norway)
const DEFAULT_REGION = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// Dark map style for better visibility
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

// Custom marker for contacts
const ContactMarker = ({ contact, onPress }) => {
  return (
    <Marker
      coordinate={{
        latitude: contact.location.latitude,
        longitude: contact.location.longitude,
      }}
      onPress={() => onPress(contact)}
      title={contact.name || 'Medvandrer'}
      description={`Nivå ${contact.level || 1}`}
    >
      <View style={markerStyles.container}>
        <View style={markerStyles.avatarContainer}>
          {(contact.avatarUrl || contact.image) ? (
            <Image source={{ uri: contact.avatarUrl || contact.image }} style={markerStyles.avatar} />
          ) : (
            <View style={markerStyles.avatarPlaceholder}>
              <Text style={markerStyles.avatarText}>
                {(contact.name || 'M').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={markerStyles.pointer} />
      </View>
    </Marker>
  );
};

export default function FlokkenMapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);

  const { contacts, loadContacts, syncContactsWithBackend } = useContacts();
  const { isSharing, currentLocation } = useLocationSharing();

  const contactsWithLocation = contacts.filter(c => c.location?.latitude && c.location?.longitude);

  // Set header button for settings
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('FlokkenSettings')}
          style={{
            marginRight: 8,
            padding: 8,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <Icon name="settings-outline" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
    syncContactsWithBackend();
  }, []);

  // Calculate initial region based on contacts and current location
  const getInitialRegion = () => {
    const points = [];
    
    if (currentLocation?.latitude && currentLocation?.longitude) {
      points.push(currentLocation);
    }
    
    contactsWithLocation.forEach(c => {
      if (c.location?.latitude && c.location?.longitude) {
        points.push({ latitude: c.location.latitude, longitude: c.location.longitude });
      }
    });
    
    if (points.length === 0) {
      return DEFAULT_REGION;
    }
    
    if (points.length === 1) {
      return {
        ...points[0],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    // Calculate bounds
    const lats = points.map(p => p.latitude);
    const lngs = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.5),
    };
  };

  const centerOnUser = () => {
    if (currentLocation?.latitude && currentLocation?.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const fitAllMarkers = () => {
    if (mapRef.current && contactsWithLocation.length > 0) {
      const coordinates = contactsWithLocation.map(c => ({
        latitude: c.location.latitude,
        longitude: c.location.longitude,
      }));
      
      if (currentLocation?.latitude) {
        coordinates.push({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });
      }
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  };

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  // Center map on a specific contact
  const centerOnContact = (contact) => {
    if (mapRef.current && contact.location?.latitude && contact.location?.longitude) {
      mapRef.current.animateToRegion({
        latitude: contact.location.latitude,
        longitude: contact.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={getInitialRegion()}
        showsUserLocation={!!currentLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        customMapStyle={darkMapStyle}
      >
        {/* Contact markers */}
        {contactsWithLocation.map(contact => (
          <ContactMarker
            key={contact.id}
            contact={contact}
            onPress={handleContactPress}
          />
        ))}
      </MapView>
      
      {/* Map controls */}
      <View style={styles.mapControls}>
        {currentLocation?.latitude && (
          <TouchableOpacity style={styles.mapControlButton} onPress={centerOnUser}>
            <Icon name="locate" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {contactsWithLocation.length > 0 && (
          <TouchableOpacity style={styles.mapControlButton} onPress={fitAllMarkers}>
            <Icon name="expand" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Contact chips at bottom */}
      {contactsWithLocation.length > 0 && (
        <View style={styles.contactsList}>
          <Text style={styles.contactsTitle}>
            {contactsWithLocation.length} deler posisjon
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsScroll}>
            {contactsWithLocation.map(contact => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.contactChip}
                onPress={() => centerOnContact(contact)}
                onLongPress={() => handleContactPress(contact)}
              >
                <View style={styles.contactAvatar}>
                  {(contact.avatarUrl || contact.image) ? (
                    <Image source={{ uri: contact.avatarUrl || contact.image }} style={styles.contactAvatarImage} />
                  ) : (
                    <Text style={styles.contactAvatarText}>
                      {(contact.name || 'M').charAt(0).toUpperCase()}
                    </Text>
                  )}
                  <View style={styles.locationDot} />
                </View>
                <Text style={styles.contactName} numberOfLines={1}>
                  {contact.name || 'Medvandrer'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Empty state */}
      {contactsWithLocation.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyCard}>
            <Icon name="people-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>
              Ingen kontakter deler posisjon ennå
            </Text>
            <Text style={styles.emptySubtext}>
              Når kontaktene dine slår på posisjonsdeling, vil de vises her
            </Text>
          </View>
        </View>
      )}

      {/* Contact Detail Modal */}
      <ContactDetailModal
        visible={showContactDetail}
        contact={selectedContact}
        onClose={() => {
          setShowContactDetail(false);
          setSelectedContact(null);
        }}
        onContactUpdated={loadContacts}
      />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.white,
    marginTop: -2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  contactsList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
    ...theme.shadows.medium,
  },
  contactsTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  contactsScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  contactChip: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: 70,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  contactAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactAvatarText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  locationDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  contactName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
    marginHorizontal: theme.spacing.lg,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

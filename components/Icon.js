import React from 'react';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Modern icon component using Expo Vector Icons
const Icon = ({ name, size = 24, color = '#000', library = 'ionicons' }) => {
  const iconMap = {
    // Navigation icons
    'home': { lib: 'ionicons', name: 'home' },
    'home-outline': { lib: 'ionicons', name: 'home-outline' },
    'calendar': { lib: 'ionicons', name: 'calendar' },
    'calendar-outline': { lib: 'ionicons', name: 'calendar-outline' },
    'people': { lib: 'ionicons', name: 'people' },
    'people-outline': { lib: 'ionicons', name: 'people-outline' },
    'information-circle': { lib: 'ionicons', name: 'information-circle' },
    'information-circle-outline': { lib: 'ionicons', name: 'information-circle-outline' },
    'call': { lib: 'ionicons', name: 'call' },
    'call-outline': { lib: 'ionicons', name: 'call-outline' },
    
    // Contact icons
    'person': { lib: 'ionicons', name: 'person' },
    'person-outline': { lib: 'ionicons', name: 'person-outline' },
    'person-circle-outline': { lib: 'ionicons', name: 'person-circle-outline' },
    'mail': { lib: 'ionicons', name: 'mail' },
    'mail-outline': { lib: 'ionicons', name: 'mail-outline' },
    'location': { lib: 'ionicons', name: 'location' },
    'location-outline': { lib: 'ionicons', name: 'location-outline' },
    'globe': { lib: 'ionicons', name: 'globe' },
    'globe-outline': { lib: 'ionicons', name: 'globe-outline' },
    'business': { lib: 'ionicons', name: 'business' },
    'business-outline': { lib: 'ionicons', name: 'business-outline' },
    
    // Activity icons
    'heart': { lib: 'ionicons', name: 'heart' },
    'heart-outline': { lib: 'ionicons', name: 'heart-outline' },
    'map': { lib: 'ionicons', name: 'map' },
    'map-outline': { lib: 'ionicons', name: 'map-outline' },
    'snow': { lib: 'material', name: 'ac-unit' },
    'leaf': { lib: 'material', name: 'eco' },
    'walk': { lib: 'material', name: 'directions-walk' },
    'trophy': { lib: 'ionicons', name: 'trophy' },
    'trophy-outline': { lib: 'ionicons', name: 'trophy-outline' },
    'time': { lib: 'ionicons', name: 'time' },
    'time-outline': { lib: 'ionicons', name: 'time-outline' },
    
    // Other icons
    'card': { lib: 'ionicons', name: 'card' },
    'card-outline': { lib: 'ionicons', name: 'card-outline' },
    'phone-portrait': { lib: 'ionicons', name: 'phone-portrait' },
    'phone-portrait-outline': { lib: 'ionicons', name: 'phone-portrait-outline' },
    'logo-facebook': { lib: 'ionicons', name: 'logo-facebook' },
    'medical': { lib: 'ionicons', name: 'medical' },
    'medical-outline': { lib: 'ionicons', name: 'medical-outline' },
    'chevron-forward': { lib: 'ionicons', name: 'chevron-forward' },
    'chevron-forward-outline': { lib: 'ionicons', name: 'chevron-forward' },
    'checkmark-circle': { lib: 'ionicons', name: 'checkmark-circle' },
    'checkmark-circle-outline': { lib: 'ionicons', name: 'checkmark-circle-outline' },
    'person-add': { lib: 'ionicons', name: 'person-add' },
    'person-add-outline': { lib: 'ionicons', name: 'person-add-outline' },
    'arrow-forward': { lib: 'ionicons', name: 'arrow-forward' },
    'close-circle': { lib: 'ionicons', name: 'close-circle' },
    'close-circle-outline': { lib: 'ionicons', name: 'close-circle-outline' },
  };

  const iconConfig = iconMap[name] || { lib: 'ionicons', name: 'help-circle-outline' };
  const iconLib = iconConfig.lib || library;

  if (iconLib === 'ionicons') {
    return <Ionicons name={iconConfig.name} size={size} color={color} />;
  } else if (iconLib === 'material') {
    return <MaterialIcons name={iconConfig.name} size={size} color={color} />;
  } else if (iconLib === 'materialcommunity') {
    return <MaterialCommunityIcons name={iconConfig.name} size={size} color={color} />;
  } else if (iconLib === 'fontawesome5') {
    return <FontAwesome5 name={iconConfig.name} size={size} color={color} />;
  }

  return <Ionicons name="help-circle-outline" size={size} color={color} />;
};

export default Icon;


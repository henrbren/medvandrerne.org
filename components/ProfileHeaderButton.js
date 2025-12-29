import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useProfileModal } from '../contexts/ProfileModalContext';
import { theme } from '../constants/theme';

export default function ProfileHeaderButton({ onPress }) {
  const { user, isAuthenticated } = useAuth();
  const { showProfileModal } = useProfileModal();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      showProfileModal();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {isAuthenticated && user?.avatarUrl ? (
        <Image 
          source={{ uri: user.avatarUrl }} 
          style={styles.avatar}
        />
      ) : isAuthenticated && user?.name ? (
        <View style={styles.avatarPlaceholder}>
          <Ionicons 
            name="person" 
            size={18} 
            color={theme.colors.primary} 
          />
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons 
            name="person-circle-outline" 
            size={28} 
            color={theme.colors.white} 
          />
        </View>
      )}
      {/* Status indicator for logged in users */}
      {isAuthenticated && (
        <View style={styles.statusDot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
});


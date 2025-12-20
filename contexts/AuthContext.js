import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext();

const AUTH_TOKEN_KEY = '@medvandrerne_auth_token';
const USER_DATA_KEY = '@medvandrerne_user_data';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved auth state on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        await refreshUserData(storedToken);
      }
    } catch (err) {
      console.error('Error loading auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async (authToken = token) => {
    if (!authToken) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me.php`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          await logout();
          return null;
        }
        throw new Error('Failed to refresh user data');
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
    return null;
  };

  const login = async (phone) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Innlogging feilet');
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token),
          AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user)),
        ]);

        return { success: true, user: data.user, isNew: data.message.includes('opprettet') };
      } else {
        throw new Error(data.error || 'Innlogging feilet');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Call logout API
        await fetch(`${API_BASE_URL}/auth/logout.php`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setToken(null);
      setUser(null);
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);
    }
  };

  const updateProfile = async (updates) => {
    if (!token) return { success: false, error: 'Ikke innlogget' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'Kunne ikke oppdatere profil');
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const syncProgress = async (progress) => {
    if (!token) return { success: false, error: 'Ikke innlogget' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/sync-progress.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(progress),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'Kunne ikke synkronisere fremgang');
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Fetch membership tiers
  const getMembershipTiers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/membership/tiers.php`);
      const data = await response.json();
      if (data.success) {
        return { success: true, tiers: data.tiers };
      }
      return { success: false, error: 'Kunne ikke hente medlemskap' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Select membership tier and register
  const selectMembership = async (phone, tierId, name = '', email = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/membership/select.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, tier: tierId, name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke velge medlemskap');
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token),
          AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user)),
        ]);

        return { success: true, user: data.user, membership: data.membership, paymentInfo: data.paymentInfo };
      } else {
        throw new Error(data.error || 'Kunne ikke velge medlemskap');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Confirm membership payment
  const confirmMembership = async (paymentMethod = 'manual', transactionId = null) => {
    if (!token) return { success: false, error: 'Ikke innlogget' };

    try {
      const response = await fetch(`${API_BASE_URL}/membership/confirm.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod, transactionId }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'Kunne ikke bekrefte medlemskap');
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Upload avatar image
  const uploadAvatar = async (imageUri) => {
    if (!token) return { success: false, error: 'Ikke innlogget' };

    try {
      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await fetch(`${API_BASE_URL}/users/upload-avatar.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user, avatarUrl: data.avatarUrl };
      } else {
        throw new Error(data.error || 'Kunne ikke laste opp bilde');
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if user has active membership
  const hasActiveMembership = () => {
    if (!user || !user.membership) return false;
    if (user.membership.status !== 'active') return false;
    if (user.membership.expiresAt && new Date(user.membership.expiresAt) < new Date()) return false;
    return true;
  };

  // Check if user has pending membership
  const hasPendingMembership = () => {
    if (!user || !user.membership) return false;
    return user.membership.status === 'pending';
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateProfile,
    syncProgress,
    refreshUserData,
    getMembershipTiers,
    selectMembership,
    confirmMembership,
    hasActiveMembership,
    hasPendingMembership,
    uploadAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

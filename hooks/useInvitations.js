import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

const INVITATIONS_CACHE_KEY = '@medvandrerne_invitations_cache';
const USER_ID_KEY = '@medvandrerne_user_id';

/**
 * Hook for managing activity invitations
 * Handles sending, receiving, and responding to invitations
 */
export const useInvitations = () => {
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [userId, setUserId] = useState(null);

  // Get user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem(USER_ID_KEY);
      setUserId(id);
    };
    getUserId();
  }, []);

  // Fetch invitations when user ID is available
  useEffect(() => {
    if (userId) {
      fetchInvitations();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetch all invitations for the current user
   */
  const fetchInvitations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/get.php?userId=${userId}&type=all&_t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReceivedInvitations(data.received || []);
          setSentInvitations(data.sent || []);
          setPendingCount(data.pendingCount || 0);

          // Cache the data
          await AsyncStorage.setItem(INVITATIONS_CACHE_KEY, JSON.stringify({
            received: data.received || [],
            sent: data.sent || [],
            pendingCount: data.pendingCount || 0,
            cachedAt: Date.now(),
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      // Try to load from cache
      try {
        const cached = await AsyncStorage.getItem(INVITATIONS_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          setReceivedInvitations(cachedData.received || []);
          setSentInvitations(cachedData.sent || []);
          setPendingCount(cachedData.pendingCount || 0);
        }
      } catch (cacheError) {
        console.error('Error loading cached invitations:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Send an invitation to a contact for an activity
   */
  const sendInvitation = useCallback(async ({
    activityId,
    activityTitle,
    activityDate,
    recipientId,
    recipientName,
    senderName,
    senderLevel,
    message,
  }) => {
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/invitations/send.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          activityTitle,
          activityDate,
          senderId: userId,
          senderName,
          senderLevel,
          recipientId,
          recipientName,
          message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setSentInvitations(prev => [data.invitation, ...prev]);
        return { success: true, invitation: data.invitation };
      } else {
        return { success: false, error: data.error || 'Kunne ikke sende invitasjon' };
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      return { success: false, error: 'Nettverksfeil. Prøv igjen.' };
    }
  }, [userId]);

  /**
   * Respond to an invitation (accept or decline)
   */
  const respondToInvitation = useCallback(async (invitationId, response, autoRegister = false, userName = '') => {
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/invitations/respond.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          userId,
          response, // 'accept' or 'decline'
          autoRegister,
          userName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setReceivedInvitations(prev =>
          prev.map(inv =>
            inv.id === invitationId
              ? { ...inv, status: response === 'accept' ? 'accepted' : 'declined', respondedAt: new Date().toISOString() }
              : inv
          )
        );
        setPendingCount(prev => Math.max(0, prev - 1));
        return { success: true, invitation: data.invitation };
      } else {
        return { success: false, error: data.error || 'Kunne ikke svare på invitasjon' };
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return { success: false, error: 'Nettverksfeil. Prøv igjen.' };
    }
  }, [userId]);

  /**
   * Mark an invitation as seen
   */
  const markAsSeen = useCallback(async (invitationId) => {
    if (!userId) return;

    try {
      await fetch(`${API_BASE_URL}/invitations/mark-seen.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          userId,
        }),
      });

      // Update local state
      setReceivedInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId
            ? { ...inv, seenAt: new Date().toISOString() }
            : inv
        )
      );
    } catch (error) {
      console.error('Error marking invitation as seen:', error);
    }
  }, [userId]);

  /**
   * Get invitations for a specific activity
   */
  const getInvitationsForActivity = useCallback((activityId) => {
    return {
      received: receivedInvitations.filter(inv => inv.activityId === activityId),
      sent: sentInvitations.filter(inv => inv.activityId === activityId),
    };
  }, [receivedInvitations, sentInvitations]);

  /**
   * Check if user has pending invitation for an activity
   */
  const hasPendingInvitationForActivity = useCallback((activityId) => {
    return receivedInvitations.some(
      inv => inv.activityId === activityId && inv.status === 'pending'
    );
  }, [receivedInvitations]);

  /**
   * Check if user has already invited a specific contact to an activity
   */
  const hasInvitedContactToActivity = useCallback((contactId, activityId) => {
    return sentInvitations.some(
      inv => inv.recipientId === contactId && inv.activityId === activityId
    );
  }, [sentInvitations]);

  /**
   * Get pending invitations (not yet responded to)
   */
  const getPendingInvitations = useCallback(() => {
    return receivedInvitations.filter(inv => inv.status === 'pending');
  }, [receivedInvitations]);

  /**
   * Get unseen invitations
   */
  const getUnseenInvitations = useCallback(() => {
    return receivedInvitations.filter(inv => !inv.seenAt && inv.status === 'pending');
  }, [receivedInvitations]);

  return {
    receivedInvitations,
    sentInvitations,
    loading,
    pendingCount,
    fetchInvitations,
    sendInvitation,
    respondToInvitation,
    markAsSeen,
    getInvitationsForActivity,
    hasPendingInvitationForActivity,
    hasInvitedContactToActivity,
    getPendingInvitations,
    getUnseenInvitations,
  };
};

export default useInvitations;


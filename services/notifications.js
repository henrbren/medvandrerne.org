import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestPermissions = async () => {
  if (Platform.OS === 'web') {
    return { status: 'granted' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { status: 'denied' };
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF453A',
    });
  }

  return { status: finalStatus };
};

/**
 * Schedule a notification for an activity
 */
export const scheduleActivityNotification = async (activity) => {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!activity || !activity.id || !activity.date) {
    return null;
  }

  // Request permissions first
  const { status } = await requestPermissions();
  if (status !== 'granted') {
    console.warn('Notification permissions not granted');
    return null;
  }

  try {
    // Cancel existing notifications for this activity first to avoid duplicates
    await cancelActivityNotification(activity.id);

    // Calculate notification time (1 day before activity)
    const activityDate = new Date(activity.date);
    const notificationDate = new Date(activityDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(18, 0, 0, 0); // 6 PM the day before

    // Don't schedule if the notification time is in the past
    if (notificationDate < new Date()) {
      // Schedule for 1 hour before activity instead
      const oneHourBefore = new Date(activityDate);
      if (activity.time) {
        const timeMatch = activity.time.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          oneHourBefore.setHours(parseInt(timeMatch[1]) - 1, parseInt(timeMatch[2]), 0, 0);
        } else {
          oneHourBefore.setHours(9, 0, 0, 0); // Default to 9 AM
        }
      } else {
        oneHourBefore.setHours(9, 0, 0, 0);
      }

      if (oneHourBefore < new Date()) {
        console.log('Activity is in the past, skipping notification');
        return null;
      }

      notificationDate.setTime(oneHourBefore.getTime());
    }

    const title = activity.title || 'Aktivitet';
    const body = activity.time
      ? `I morgen kl. ${activity.time}`
      : activity.multiDay
      ? `Starter ${activityDate.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })}`
      : `I morgen`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: {
          activityId: activity.id,
          activityTitle: activity.title,
        },
        sound: true,
      },
      trigger: {
        type: 'date',
        date: notificationDate,
      },
    });

    console.log(`Scheduled notification ${notificationId} for activity ${activity.id}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancel a notification for an activity
 */
export const cancelActivityNotification = async (activityId) => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Find and cancel notifications for this activity
    const notificationsToCancel = scheduledNotifications.filter(
      (notification) => notification.content.data?.activityId === activityId
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Cancelled notification ${notification.identifier} for activity ${activityId}`);
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all activity notifications
 */
export const cancelAllActivityNotifications = async () => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.activityId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications for activities
 */
export const getScheduledActivityNotifications = async () => {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.filter(
      (notification) => notification.content.data?.activityId
    );
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Clean up old and duplicate notifications
 */
export const cleanupNotifications = async () => {
  if (Platform.OS === 'web') {
    return 0;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const now = new Date();
    let cleanedCount = 0;

    // Track activity IDs to find duplicates
    const activityNotifications = new Map();

    for (const notification of scheduledNotifications) {
      const activityId = notification.content.data?.activityId;
      
      if (activityId) {
        // Check if notification trigger date is in the past
        const triggerDate = notification.trigger?.date 
          ? new Date(notification.trigger.date) 
          : null;
        
        if (triggerDate && triggerDate < now) {
          // Cancel past notifications
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          cleanedCount++;
          continue;
        }

        // Track duplicates - keep only the most recent one
        if (activityNotifications.has(activityId)) {
          const existing = activityNotifications.get(activityId);
          const existingDate = existing.trigger?.date ? new Date(existing.trigger.date) : null;
          
          if (!triggerDate || (existingDate && triggerDate < existingDate)) {
            // Cancel the older duplicate
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            cleanedCount++;
            continue;
          } else {
            // Cancel the existing one, keep this one
            await Notifications.cancelScheduledNotificationAsync(existing.identifier);
            cleanedCount++;
          }
        }
        
        activityNotifications.set(activityId, notification);
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old or duplicate notifications`);
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return 0;
  }
};

/**
 * Get Expo push token and register with backend
 */
export const registerPushToken = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Request permissions first
    const { status } = await requestPermissions();
    if (status !== 'granted') {
      console.warn('Push notification permissions not granted');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'd0b7a060-9efc-481c-b7c5-5a44ae3e5785', // EAS project ID
    });
    
    const pushToken = tokenData.data;
    console.log('Got Expo push token:', pushToken);

    // Get user ID
    const userId = await AsyncStorage.getItem('@medvandrerne_user_id');
    if (!userId) {
      console.warn('No user ID found, cannot register push token');
      return pushToken;
    }

    // Register token with backend
    try {
      const response = await fetch(`${API_BASE_URL}/push/register-token.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          pushToken: pushToken,
          deviceType: Platform.OS,
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Push token registered with backend:', result);
      } else {
        console.warn('Failed to register push token with backend:', response.status);
      }
    } catch (error) {
      console.error('Error registering push token with backend:', error);
    }

    return pushToken;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (onNotificationReceived, onNotificationResponse) => {
  if (Platform.OS === 'web') {
    return () => {};
  }

  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when user taps on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('User tapped notification:', response);
    if (onNotificationResponse) {
      onNotificationResponse(response);
    }
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Get last notification response (for when app is opened from notification)
 */
export const getLastNotificationResponse = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response;
  } catch (error) {
    console.error('Error getting last notification response:', error);
    return null;
  }
};


import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
      trigger: notificationDate,
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


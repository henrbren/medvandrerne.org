import * as Notifications from 'expo-notifications';

const scheduleLocalNotification = async (title, body, extraData, futureDate) => {
  // Sjekk at futureDate er en gyldig dato i fremtiden
  if (!(futureDate instanceof Date) || futureDate <= new Date()) {
    throw new Error("Ugyldig dato eller datoen er i fortiden.");
  }

  const trigger = new Date(futureDate);
  trigger.setSeconds(0);

  const schedulingOptions = {
    content: {
      title: title,
      body: body,
      data: { extraData },
    },
    trigger,
  };

  return await Notifications.scheduleNotificationAsync(schedulingOptions);
};

export default scheduleLocalNotification;

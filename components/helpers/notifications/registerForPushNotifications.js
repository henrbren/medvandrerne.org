
import * as Notifications from 'expo-notifications';

const registerForPushNotifications = async () => {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Advarsel', 'Du vil ikke motta varsler hvis du ikke gir tillatelse.');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  // Lagre tokenet på en trygg plass for fremtidig bruk, f.eks. på server eller i AsyncStorage.
};

export default registerForPushNotifications;

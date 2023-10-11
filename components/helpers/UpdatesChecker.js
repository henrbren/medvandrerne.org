import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      Alert.alert(
        'Ny oppdatering tilgjengelig',
        'Vil du laste ned den nye oppdateringen?',
        [
          { text: 'Nei', style: 'cancel' },
          { text: 'Ja', onPress: async () => {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }
          },
        ],
        { cancelable: false }
      );
    }
  } catch (e) {
    console.log("Couldn't check for updates: ", e);
  }
};

export default checkForUpdates;

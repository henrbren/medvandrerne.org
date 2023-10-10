


import React, { useState, useEffect } from 'react';
import {Alert} from 'react-native';
import Parse from 'parse/react-native';
import { AuthContext } from "@components/helpers/auth/AuthContext";
import { localize } from "@translations/localize";
import * as Haptics from 'expo-haptics';


export const useUserLogOut = () => {
  const { signOut } = React.useContext(AuthContext);

  const confirmLogOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert(
      localize('main.meta.logoutConfirm'),
      localize('main.meta.logoutNowQuestion'),
      [
        {
          text: localize('main.meta.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: localize('main.meta.logoutNow'),
          style: 'destructive',
          onPress: () => doUserLogOut(),
        },
      ],
      { cancelable: false },
    );
  };

  const doUserLogOut = async () => {
    return await Parse.User.logOut()
    .then(async () => {
      // To verify that current user is now empty, currentAsync can be used
      const currentUser = await Parse.User.currentAsync();
      
      if (currentUser === null) {

        signOut();

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        )

      }
    

      return true;
    })
    .catch((error) => {
      Alert.alert('Error!', error.message);
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
      return false;
    });
  };

  return confirmLogOut;
};

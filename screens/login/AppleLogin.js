import React from 'react';
import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';


import Parse from 'parse/react-native';
import { AuthContext } from "@components/helpers/auth/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';

const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token is not a valid JWT token');
    }

    const payload = parts[1];
    const decodedPayload = JSON.parse(base64.decode(payload));

    return decodedPayload;
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
};

export const doAppleLogin = async function (signIn) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
  
      const appleEmail = decodeJWT(credential.identityToken).email;
      const appleId = decodeJWT(credential.identityToken).sub;


      const authData = {
        id: appleId,
        token: credential.identityToken,
      };

      let userToLogin = new Parse.User();
      userToLogin.set('username', appleEmail);
      userToLogin.set('email', appleEmail);
  
      return await userToLogin
        .linkWith('apple', {
          authData: authData,
        })
        .then(async (loggedInUser) => {
     
          signIn();

          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          )


          return true;
        })
        .catch(async (error) => {
          Alert.alert('Error!', error.message);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          )
          return false;
        });
    } catch (error) {
      if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        )
      } else {
        Alert.alert('Error!', error.message);
      }
    }
  };
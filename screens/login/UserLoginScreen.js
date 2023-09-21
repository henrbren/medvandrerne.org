import React, {FC, ReactElement, useState} from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Parse from 'parse/react-native';
import Styles from '@styles/Main';
import LottieView from 'lottie-react-native';

import * as AppleAuthentication from 'expo-apple-authentication';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { localize, } from '@translations/localize';
import { AuthContext } from "@components/helpers/auth/AuthContext";


export const UserLoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = React.useContext(AuthContext);

  const goToUserRegistration = () => {
    navigation.navigate('UserRegistrationScreen')
  }

  const doAppleLogin = async function () {
    try {
              
      let appleId = '';
      let appleEmail = '';

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const authData = {
        id: appleId,
        token: credential.identityToken,
      };

      let userToLogin = new Parse.User();
      // Set username and email to match provider email
      userToLogin.set('username', appleEmail);
      userToLogin.set('email', appleEmail);
      return await userToLogin
        .linkWith('apple', {
          authData: authData,
        })
        .then(async (loggedInUser) => {
          // logIn returns the corresponding ParseUser object
          Alert.alert(
            'Success!',
            `User ${loggedInUser.get('username')} has successfully signed in!`,
          );
          signIn()
          // To verify that this is in fact the current user, currentAsync can be used
          const currentUser = await Parse.User.currentAsync();
          console.log(loggedInUser === currentUser);
          // Navigation.navigate takes the user to the screen named after the one
          // passed as parameter
          navigation.navigate('Home');
          return true;
        })
        .catch(async (error) => {
          // Error can be caused by wrong parameters or lack of Internet connection
          Alert.alert('Error!', error.message);
          return false;
        });


      // signed in
    } catch (e) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }
  const doUserLogIn = async function () {
    // Note that these values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;
    return await Parse.User.logIn(usernameValue, passwordValue)
      .then(async (loggedInUser) => {

        signIn()
        // To verify that this is in fact the current user, currentAsync can be used
        const currentUser = await Parse.User.currentAsync();
        console.log(loggedInUser === currentUser);
        return true;
      })
      .catch((error) => {
        // Error can be caused by wrong parameters or lack of Internet connection
        Alert.alert('Error!', error.message);
        return false;
      });
  };
  

  return (
    <View style={Styles.login_wrapper}>
      <View>
      <LottieView style={{width: 350}}  source={require('@animations/dog.json')} autoPlay loop={true}   />
      <Text style={Styles.login_title}>{localize('main.login.title')}</Text>

      </View>
      <View style={Styles.form}>
    
        <TextInput
          style={Styles.form_input}
          value={username}
          placeholder={localize('main.login.username')}
          onChangeText={(text) => setUsername(text)}
          autoCapitalize={'none'}
          keyboardType={'email-address'}
        />
        <TextInput
          style={Styles.form_input}
          value={password}
          placeholder={localize('main.login.password')}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity onPress={() => doUserLogIn()}>
          <View style={Styles.button}>
            <Text style={Styles.button_label}>{localize('main.login.login')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goToUserRegistration()}>
          <View style={[Styles.button, {marginTop: 10}]}>
            <Text style={Styles.button_label}>{localize('main.login.register')}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={Styles.login_social}>
        <View style={Styles.login_social_separator}>
          <View style={Styles.login_social_separator_line} />
          <Text style={Styles.login_social_separator_text}>Eller</Text>
          <View style={Styles.login_social_separator_line} />
        </View>
        <View style={Styles.login_social_buttons}>
  
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={Styles.button}
                onPress={doAppleLogin}
              />
           
        </View>
      </View>
    </View>
  );
};
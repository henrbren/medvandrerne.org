import React, {useState, useEffect} from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Animated,
  Platform,
  StyleSheet
} from 'react-native';
import Parse from 'parse/react-native';

import LottieView from 'lottie-react-native';
import { doAppleLogin } from './AppleLogin';

import * as Haptics from 'expo-haptics';

import * as AppleAuthentication from 'expo-apple-authentication';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { localize, } from '@translations/localize';

import { AuthContext } from "@components/helpers/auth/AuthContext";


export const UserLoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = React.useContext(AuthContext);
  const fadeIn = new Animated.Value(0);

  

  React.useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  const AnimatedText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);
    useEffect(() => {
  
      if (index < text.length) {
        setTimeout(() => {
          setDisplayedText(displayedText + text[index]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setIndex(index + 1);
        }, 100);  // Set the speed of animation here
      }
    }, [index]);
  
    return (
      <View>
        <Text style={Styles.login_title}>
          {displayedText}
        </Text>
      </View>
    );
  };

  const goToUserLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('UserLoginEmailScreen')
  }

  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={Styles.container}
    >
              <View style={Styles.logoSection}>

              <LottieView
            style={{ width: '100%', marginBottom: 20 }}
            source={require('@animations/dogs/fetch.json')}
            autoPlay
            loop={true}
          />


                        <AnimatedText text={localize('main.login.title')}  />
 
                
      
        </View>
      <Animated.View style={{ ...Styles.login_wrapper, opacity: fadeIn }}>
       
        <View style={Styles.form}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            buttonText={localize('main.login.loginWithApple')}
            cornerRadius={5}
            style={Styles.button}
            onPress={() => doAppleLogin(signIn)}
          />
        </View>
        <View style={Styles.login_social}>
    
          <TouchableOpacity onPress={() => goToUserLogin()}>
            <View style={Styles.small_button}>
              <Text style={Styles.small_button_label}>
                {localize('main.login.loginWithEmail')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // Endret til hvit
  },
  login_wrapper: {
    width: '90%',
    maxWidth: 400,
  },
  logoSection: {
    alignItems: 'center',
  },
  form: {
    
  },
  small_button: {
    padding: 15,
    borderRadius: 5, // Runde hjørner
    backgroundColor: '#007AFF', // iOS-blå
    alignItems: 'center',
  },
  small_button_label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#1D1D1D',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    height: 55,
  },
  login_title: {
    fontSize: 24,
    fontWeight: '700',
    maxWidth: 300,
    textAlign: 'center',
    marginVertical: 10,
    marginBottom: 20,
    color: '#1D1D1D',

  },
  login_social: {
    marginTop: 40,
  },
  login_social_separator: {
    alignItems: 'center',
  },
  login_social_separator_text: {
    marginHorizontal: 10,
    color: '#1D1D1D',
    fontSize: 18,
    fontWeight: '400',
   
  },
});

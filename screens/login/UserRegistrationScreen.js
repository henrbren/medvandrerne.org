import React, { FC, ReactElement, useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View, TouchableOpacity, Text,   KeyboardAvoidingView, } from "react-native";
import Parse from "parse/react-native";
import { localize, } from '@translations/localize';


import LottieView from 'lottie-react-native';


export const UserRegistrationScreen = ({navigation}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const goToSocialLogin = () => {
    navigation.navigate('UserLoginEmailScreen')
  }
  


  const doUserRegistration = async function () {
    // Note that these values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;
    // Since the signUp method returns a Promise, we need to call it using await
    return await Parse.User.signUp(usernameValue, passwordValue)
      .then((createdUser) => {
        // Parse.User.signUp returns the already created ParseUser object if successful
        Alert.alert(
          "Success!",
          `User ${createdUser.get("username")} was successfully created!`
        );
        return true;
      })
      .catch((error) => {
        // signUp can fail if any parameter is blank or failed an uniqueness check on the server
        Alert.alert("Error!", error.message);
        return false;
      });
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={Styles.container}
  >
            <View style={Styles.logoSection}>
          
                  <LottieView
                style={{ width: '80%', }}
                source={require('@animations/dogs/social.json')}
                autoPlay
                loop={true}
              />  
              
              <Text style={Styles.login_title}>{localize('main.login.registerNewAccount')}</Text>
    
      </View>
    <View style={{ ...Styles.login_wrapper }}>
     
      <View style={Styles.form}>
      <TextInput
              style={Styles.form_input}
              value={username}
              placeholder={localize('main.login.username')}
              onChangeText={(text) => setUsername(text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={Styles.form_input}
              value={password}
              placeholder={localize('main.login.password')}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
            />
         
      </View>

          <TouchableOpacity onPress={() => doUserRegistration()}>
            <View style={[Styles.button, { marginTop: 10 }]}>
              <Text style={Styles.button_label}>
                {localize('main.login.register')}
              </Text>
            </View>
          </TouchableOpacity>
      <View style={Styles.login_social}>
  
        <TouchableOpacity onPress={() => goToSocialLogin()}>
          <View style={Styles.small_button}>
            <Text style={Styles.small_button_label}>
              {localize('main.meta.back')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
  form_input: {
    height: 56,
    borderRadius: 12, // Mer avrundet
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  form: {
    
  },
  small_button: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#f2f2f2', // iOS-blå
    alignItems: 'center',
  },
  small_button_label: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF', // iOS-blå
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    height: 55,
  },
  button_label: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '500',
  },
  login_title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    maxWidth: 300,
    textAlign: 'center',
    marginVertical: 10,
    color: '#1D1D1D',
  },
  login_social: {
    marginTop: 40,
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

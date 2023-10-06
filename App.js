import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {Image, SafeAreaView, StatusBar, Text, View} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';

import  LoadingAppView  from "@components/helpers/loading/LoadingAppView";
import { localize, initLanguage } from './translations/localize';
import { AuthContext } from "@components/helpers/auth/AuthContext";

import { LoginNavigator } from "@navigators/LoginNavigator";
import { MainNavigator } from "@navigators/MainNavigator";

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import FlashMessage from "react-native-flash-message";


// Your Parse initialization configuration goes here
Parse.setAsyncStorage(AsyncStorage);

const PARSE_APPLICATION_ID = 'CpJjLgifpZ0oK2u3fcNo5LgRnUv04QddFa4T6cHY';
const PARSE_HOST_URL =  'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_ID = 'YAPKgdCiARykHrul1UQwReBEXgHOV6cb2V4iOWgD';

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_ID);
Parse.serverURL = PARSE_HOST_URL;

const App = () => {

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            isLoading: false,
            loggedin: true,
   
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isLoading: false,
            loggedin: true,
          };
        case "REFRESH":
          return {
            ...prevState,
            isLoading: false,
            loggedin: true,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isLoading: false,
            loggedin: false,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
    }
  );

  const authContext = React.useMemo(
    () => ({
      signIn: async (input) => {
        dispatch({
          type: "SIGN_IN",
        });
      },
      refresh: async (input) => {
        dispatch({
          type: "REFRESH",
     
        });
      },
      signOut: async () => {
        dispatch({ type: "SIGN_OUT" });
      },
    }),
    []
  );

const [username, setUsername] = useState('');
const [loading, setLoading] = useState(true)



useEffect(() => {

  async function getCurrentUser() {
    // This condition ensures that username is updated only if needed
    if (username === '') {
      const currentUser = await Parse.User.currentAsync();
      if (currentUser !== null) {
        setUsername(currentUser.getUsername());
        dispatch({ type: "RESTORE_TOKEN" });
        setLoading(false)

      }else{ setLoading(false) }
    }
  }
  getCurrentUser();
}, [username]);

if (loading) {
  return <LoadingAppView />
}



return (<AuthContext.Provider value={authContext}>
                  <ActionSheetProvider>
                      {state.loggedin ? (<>
                              <MainNavigator />
                            </>) : 
                            (<>
                              <LoginNavigator />
                            </>)}
                  </ActionSheetProvider>
                  <FlashMessage position="top" />
      </AuthContext.Provider>
     );
};

export default App;
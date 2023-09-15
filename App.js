import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {Image, SafeAreaView, StatusBar, Text, View} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';

import  LoadingAppView  from "@components/helpers/loading/LoadingAppView";
import { localize, initLanguage } from './translations/localize';

import { LoginNavigator } from "@navigators/LoginNavigator";
import { MainNavigator } from "@navigators/MainNavigator";


// Your Parse initialization configuration goes here
Parse.setAsyncStorage(AsyncStorage);

const PARSE_APPLICATION_ID = '2JOpWdBSpH364kvurWrzWtA6qzDal3KxAQlXuCpE';
const PARSE_HOST_URL =  'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_ID = 'vInd50NYp4TFFaIkKFPthYrrcAF285cWAy0yVcaD';

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_ID);
Parse.serverURL = PARSE_HOST_URL;

const App = () => {

const [username, setUsername] = useState('');
const [loading, setLoading] = useState(true)


useEffect(() => {

  async function getCurrentUser() {
    // This condition ensures that username is updated only if needed
    if (username === '') {
      const currentUser = await Parse.User.currentAsync();
      if (currentUser !== null) {
        setUsername(currentUser.getUsername());
        setLoading(false)

      }else{ setLoading(false) }
    }
  }
  getCurrentUser();
}, [username]);

if (loading) {
  return <LoadingAppView />
}



return (<>
  {username ? (<>
         <MainNavigator />
       </>) : 
       (<>
         <LoginNavigator />
       </>)}
 </>
 );
};

export default App;
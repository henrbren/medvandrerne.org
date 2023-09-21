
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Alert,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import Parse from 'parse/react-native';
import { WebView } from 'react-native-webview';

import { useNavigation } from '@react-navigation/native';

import { FontAwesome5 } from '@expo/vector-icons';

import { localize } from "@translations/localize";


export const DogFormaliaScreen = ({ route, navigation }) => {

  navigator = useNavigation();

  const [registrationNumber, setRegistrationNumber] = useState('');


  useEffect(() => {
    const Dog = Parse.Object.extend('dogs');
    const dogQuery = new Parse.Query(Dog);
    
    // Setter ID for hunden du vil hente
    dogQuery.equalTo('objectId', route.params?.id);
    
    // Spesifiserer at du kun er interessert i "registrationNumber" kolonnen
    dogQuery.select('registrationNumber');
    
    // Utfører spørringen
    dogQuery.first().then((dog) => {
      if (dog) {
        // Henter ut "registrationNumber"
        const registrationNumber = dog.get('registrationNumber');
        setRegistrationNumber(registrationNumber)
   
      } else {
        console.log('No dog found with the given ID.');
      }
    }).catch((error) => {
      console.error('Error fetching dog: ', error);
    });
    
  }, []);


  const webViewURL = `https://www.dogweb.no/dogweb/dw/openPage/dogweb/hund.html?_exp=0&HUID=${registrationNumber}`;


  return (
    <View style={{ flex: 1 }}>
      {registrationNumber ? (
        <WebView source={{ uri: webViewURL }} />
      ) : (
        <Text>Loading or no registration number available</Text>
      )}
    </View>
  );

};


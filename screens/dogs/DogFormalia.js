
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import Parse from 'parse/react-native';
import NkkExtractor from '@extractors/NkkExtractor';
import { localize } from "@translations/localize";



export const DogFormaliaScreen = ({ route }) => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [dogInfo, setDogInfo] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(true);

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

  const LoadingScreen = () => (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.text}>Henter data fra NKK</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {dogInfo ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{localize('main.screens.dogDetail.formals.info')}</Text>
            {dogInfo?.dogInfo && Object.keys(dogInfo.dogInfo).map((key) => (
              <View key={key} style={styles.infoContainer}>
                <Text style={styles.label}>{key}</Text>
                <Text style={styles.value}>{dogInfo.dogInfo[key]}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{localize('main.screens.dogDetail.formals.breeder')}</Text>
            {dogInfo?.breederInfo &&Object.keys(dogInfo.breederInfo).map((key) => (
              <View key={key} style={styles.infoContainer}>
                <Text style={styles.label}>{key}</Text>
                <Text style={styles.value}>{dogInfo.breederInfo[key]}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{localize('main.screens.dogDetail.formals.parentInfo')}</Text>
            {dogInfo?.parentInfo && Object.keys(dogInfo.parentInfo).map((key) => (
              <View key={key} style={styles.infoContainer}>
                <Text style={styles.label}>{key}</Text>
                <Text style={styles.value}>{dogInfo.parentInfo[key]}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <LoadingScreen />
      )}
        <NkkExtractor url={webViewURL} onDataExtracted={setDogInfo} />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 10,
    marginBottom: 30,
  },
  card: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 14,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', // Semi-transparent white
  },
  overlay: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
  },
});




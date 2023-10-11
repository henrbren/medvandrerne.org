
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert, StyleSheet, SafeAreaView, TouchableOpacity, Text, View} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Image } from 'expo-image';
import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed

import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";

import createAndSharePDF from '@components/dogs/missing/createAndSharePDF';

import LottieView from 'lottie-react-native';


export const DogRepportMissingScreen = ({ route, navigation }) => {

  navigator = useNavigation();

  const dogName = route.params?.dogName;

  const [isMissing, setIsMissing] = useState(false);

  const [animalData, setAnimalData] = useState(null);
  const lottieRef = useRef(null);


  useEffect(() => {

    readAnimalData();
  }, []);


  async function updateIsMissing(isMissingStatus) {
    const parseQuery = new Parse.Query('dogs');
    parseQuery.equalTo("objectId", route.params.id);
  
    try {
      const dog = await parseQuery.first(); // Henter det første objektet som matcher query
      if (dog) {
        dog.set("isMissing", isMissingStatus); // Setter isMissing til true
        setIsMissing(isMissingStatus);
        await dog.save(); // Lagrer endringene
        console.log('Oppdatert isMissing til true');
      } else {
        setIsMissing(false);
        console.log('Ingen hund funnet med den objectId');
      }
    } catch (error) {
      setIsMissing(false);
      console.error('Feil under oppdatering:', error);
    }
  }
  

  const readAnimalData = async function () {
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('dogs');
    parseQuery.equalTo("objectId", route.params.id);

    try {
    let animal = await parseQuery.first(); 

      if (animal) {
        setIsMissing(animal.get('isMissing'));
        setAnimalData(animal);
      
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }
      
      return true;
    } catch (error) {

      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };



  const handleMeldFunnet = () => {
    Alert.alert(
      localize('main.screens.dogDetail.missing.form.confirm'),
      localize('main.screens.dogDetail.missing.form.questionFound'), // Melding
      [
        {
          text: localize('main.meta.cancel'),
          onPress: () => console.log('Avbrutt'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            updateIsMissing(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMeldSavnet = () => {
    Alert.alert(
      localize('main.screens.dogDetail.missing.form.confirm'),
      localize('main.screens.dogDetail.missing.form.questionMissing'), // Melding
      [
        {
          text: localize('main.meta.cancel'),
          onPress: () => console.log('Avbrutt'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            updateIsMissing(true);
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const MissingDogInfo = () => (
    <>
      <Image
        style={styles.image}
        source={{ uri: animalData.get('profileImage').url() }}
        cachePolicy={'disk'}
        blurRadius={5}
      />
      <Text style={styles.infoTitle}>
        {animalData.get('title')} {localize('main.screens.dogDetail.missing.reportedMissing')}
      </Text>
      <View style={styles.infoView}>
        <Text style={styles.infoText}>{localize('main.screens.dogDetail.missing.missingInfo')}:</Text>
        <Text style={styles.rowText}>{animalData.get('desc')}</Text>
        <Text style={styles.rowText}>{animalData.get('breed')}</Text>
      </View>
      <TouchableOpacity style={styles.buttonPdf} onPress={() => createAndSharePDF(animalData)}>
        <Text style={styles.buttonTextPdf}>{localize('main.screens.dogDetail.missing.exportPdf')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonPdf} onPress={()=>createAndSharePDF(animalData)}>
            <Text style={styles.buttonTextPdf}>{localize('main.screens.dogDetail.missing.sharePdf')}</Text>
          </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleMeldFunnet}>
        <Text style={styles.buttonText}>
          {localize('main.screens.dogDetail.missing.form.report')} {animalData.get('title')} {localize('main.screens.dogDetail.missing.form.found')}
        </Text>
      </TouchableOpacity>
    </>
  );
  

  return (<SafeAreaView style={styles.container}>
    {animalData && (<>
    {isMissing ? (
      <MissingDogInfo animalData={animalData} handleMeldSavnet={handleMeldSavnet} />
      ) : (<>
        <LottieView
        ref={lottieRef}
        style={{ width: '100%', marginBottom: 20 }}
        source={require('@animations/mapFind.json')}
        autoPlay
        loop={true}
      />
      <View style={styles.infoView}>
        <Text style={styles.infoTitle}>{localize('main.screens.dogDetail.missing.reportMissing')}</Text>
        <Text style={styles.infoText}>
          {localize('main.screens.dogDetail.missing.preInfo')}{dogName} {localize('main.screens.dogDetail.missing.info')}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleMeldSavnet}>
        <Text style={styles.buttonText}>
          {localize('main.screens.dogDetail.missing.form.report')} {dogName} {localize('main.screens.dogDetail.missing.form.missing')}
        </Text>
      </TouchableOpacity>
   </> )}
    </>)}
  </SafeAreaView> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF', // iOS blue button color
    paddingVertical: 15,
    marginTop: 20,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
  },
  rowText:{
    marginTop: 10,
  },
  buttonPdf: {
   backgroundColor: '#7D7D7D',
   padding: 10,
   borderRadius: 8,
    marginBottom: 10,
    width: '80%',
  },
  buttonTextPdf: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  image: {
    marginTop: 20,
    width: 300,
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
  },
  infoView:{
    backgroundColor: '#fff',
    width: '80%',
    paddingVertical: 15,
    paddingHorizontal:15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoViewAnim:{
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText:{
    color: '#000',
    fontWeight: 'bold',
  },
  infoTitle:{
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#000',
  },

});


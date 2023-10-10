
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert, StyleSheet, SafeAreaView, TouchableOpacity, Text} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed

import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";




export const DogRepportMissingScreen = ({ route, navigation }) => {

  navigator = useNavigation();

  const isMissing = route.params?.isMissing;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    readDogData().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    readDogData();
  }, []);


  const readDogData = async function () {

    const parseQuery = new Parse.Query('dogDocuments');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(route.params?.id);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.descending('createdAt');
  

    try {
      let dogs = await parseQuery.find();

      setReadResults(dogs);
      setIsLoading(false)
      return true;
    } catch (error) {
      Alert.alert('Error!', error.message);
      return false;
    }
  };


  const shareDocument = async () => {
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;
  
    // Last ned filen
    await FileSystem.downloadAsync(uri, localUri)
      .catch((error) => {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download file');
      });
  
    // Del filen
    const sharingOptions = {
      dialogTitle: 'Del dette dokumentet', // optional
      mimeType: 'application/pdf', // optional
      UTI: 'com.adobe.pdf' // optional for iOS
    };
  
    await Sharing.shareAsync(localUri, sharingOptions)
      .catch((error) => {
        console.error('Error sharing file:', error);
        throw new Error('Failed to share file');
      });
  };


  const handleMeldSavnet = () => {
    Alert.alert(
      'Bekreftelse', // Tittel
      '', // Melding
      [
        {
          text: 'Avbryt',
          onPress: () => console.log('Avbrutt'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            Alert.alert('Meldt savnet', 'Din melding har blitt sendt.');
            // Legg til din egen logikk her
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  
  return (<>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleMeldSavnet}>
          <Text style={styles.buttonText}>Meld savnet</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF', // iOS blue button color
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


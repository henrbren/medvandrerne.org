
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert, StyleSheet, SafeAreaView, } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed

import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";

import { DocumentForm } from '@components/dogs/documents/DocumentForm'; 
import HeaderRightButton from '@components/dogs/training/HeaderRightButton';
import DocumentList from '@components/dogs/documents/DocumentList';
import DocumentModal from '@components/dogs/documents/DocumentModal';

import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Importer ReusableBottomSheet
import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import SystemModal from '@ui/SystemModal';
import { deleteItem } from '@parse/deleteItem';


export const DogDocumentsScreen = ({ route, navigation }) => {

  navigator = useNavigation();

 const [isVisible, setIsVisible] = useState(false);
 const [selectedItem, setSelectedItem] = useState(null);
 const bottomSheetRef = useRef(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [refreshing, setRefreshing] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
  const [readResults, setReadResults] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: localize('main.screens.dogDetail.documents.title'),
      headerRight: () => <HeaderRightButton onPress={showBottomSheet} />
    });
  }, [navigation]);
    
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

  const showBottomSheet = () => {
    bottomSheetRef.current.open();
  };

  const closeSheet = () => {
    bottomSheetRef.current.close();
    readDogData()
  };

  const onSelectItem = (data) => {
    setSelectedItem(data)
    setIsVisible(true);
  };

  const onDeleteItem = (objectId) => {
    deleteItem(objectId, 'dogDocuments', readDogData, closeModal);
  };

  const closeModal = () => {
    setIsVisible(false);
    setSelectedItem(null);
  };


  const filteredResults = useMemo(() => {
    return readResults.filter(item => {
      const title = item.get('title').toLowerCase();
      //const description = item.get('desc').toLowerCase();
      const date = formatDateWithTime(item.get('createdAt')).toLowerCase();
      const query = searchQuery.toLowerCase();
  
      return title.includes(query) || date.includes(query)
    });
  }, [readResults, searchQuery]);

  const shareDocument = async () => {
    const uri = selectedItem.get('document').url()
    const fileName = selectedItem.get('title');
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

  
  return (<>
    <SafeAreaView style={styles.container}>
        <DocumentList 
            data={filteredResults} 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            onSelectItem={onSelectItem}
            onDeleteItem={onDeleteItem}  // Legg til denne linjen
            isLoading={isLoading}
          />

      <SystemModal  isVisible={isVisible} closeModal={closeModal} backdrop={true} onShare={shareDocument} >
            <DocumentModal selectedItem={selectedItem}  />
        </SystemModal>

        <SearchFieldAccessory searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

    </SafeAreaView>

      <ReusableBottomSheet
            sheetRef={bottomSheetRef}
            height={600}
            dragFromTopOnly={true}
            colors={{background: '#F9F9F9'}}
        >
          <DocumentForm dog={route.params?.id} close={closeSheet} />
      </ReusableBottomSheet>

 </> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
});


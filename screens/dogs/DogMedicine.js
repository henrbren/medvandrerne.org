
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert, StyleSheet, SafeAreaView, } from 'react-native';
import { formatDateWithTime } from '@components/helpers/DateUtils';  // adjust the import path as needed

import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";

import { DogMedicineForm } from '@components/dogs/DogMedicineForm'; 



import HeaderRightButton from '@components/dogs/training/HeaderRightButton';
import MedicineList from '@components/dogs/medicine/MedicineList';
import MedicineModal from '@components/dogs/medicine/MedicineModal';

import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Importer ReusableBottomSheet
import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import SystemModal from '@ui/SystemModal';
import { deleteItem } from '@parse/deleteItem';

export const DogMedicineScreen = ({ route, navigation }) => {

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
      title: localize('main.screens.dogDetail.medicine.title'),
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

    const parseQuery = new Parse.Query('dogMedicine');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(route.params?.id);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.descending('createdAt');
  

    try {
      let dogs = await parseQuery.find();
      console.log(dogs);
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
    deleteItem(objectId, 'dogMedicine', readDogData, closeModal);
  };

  const closeModal = () => {
    setIsVisible(false);
    setSelectedItem(null);
  };


  const filteredResults = useMemo(() => {
    return readResults.filter(item => {
      const title = item.get('title').toLowerCase();
      const description = item.get('desc').toLowerCase();
      const date = formatDateWithTime(item.get('date')).toLowerCase();
      const query = searchQuery.toLowerCase();
  
      return title.includes(query) || description.includes(query) || date.includes(query)
    });
  }, [readResults, searchQuery]);
  
  return (<>
    <SafeAreaView style={styles.container}>
        <MedicineList 
            data={filteredResults} 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            onSelectItem={onSelectItem}
            onDeleteItem={onDeleteItem}  // Legg til denne linjen
            isLoading={isLoading}
          />

      <SystemModal  isVisible={isVisible} closeModal={closeModal} backdrop={true} >
            <MedicineModal selectedItem={selectedItem}  />
        </SystemModal>

        <SearchFieldAccessory searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

    </SafeAreaView>

      <ReusableBottomSheet
            sheetRef={bottomSheetRef}
            height={600}
            dragFromTopOnly={true}
            colors={{background: '#F9F9F9'}}
        >
          <DogMedicineForm dog={route.params?.id} close={closeSheet} />
      </ReusableBottomSheet>

 </> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
});


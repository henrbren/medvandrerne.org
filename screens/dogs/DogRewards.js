
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert,View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { formatDateWithTime, calculateDetailedAge } from '@components/helpers/DateUtils';  // adjust the import path as needed
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent
import { Image } from 'expo-image';


import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';

import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { DogRewardForm } from '@components/dogs/DogRewardForm'; 
import { localize } from "@translations/localize";

import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Importer ReusableBottomSheet
import SystemModal from '@ui/SystemModal';
import { deleteItem } from '@parse/deleteItem';

import createAndSharePDF from '@components/dogs/rewards/createAndSharePDF';

export const DogRewardsScreen = ({ route, navigation }) => {

  navigator = useNavigation();

 const [isVisible, setIsVisible] = useState(false);
 const [selectedItem, setSelectedItem] = useState(null);
 const bottomSheetRef = useRef(null);
  const [username, setUsername] = useState('');

  const dogName = route.params?.dogName;
  const imageUrl = route.params?.imageUrl;

  useEffect(() => {
    navigation.setOptions({
      title: localize('main.screens.dogDetail.rewards.title'),
    
      headerRight: () => (
        <TouchableOpacity onPress={showBottomSheet} style={{ marginRight: 15, }}>
                  <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const [refreshing, setRefreshing] = useState(false);

const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  readDogData().then(() => setRefreshing(false));
}, []);

  useEffect(() => {
    readDogData();
  }, [username]);


  // State variables
  const [readResults, setReadResults] = useState([]);

  const readDogData = async function () {
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('dogRewards');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(route.params?.id);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.descending('createdAt');
  
    try {
      let dogs = await parseQuery.find();
      setReadResults(dogs);
  
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


  const onDeleteItem = (objectId) => {
    deleteItem(objectId, 'dogRewards', readDogData, closeModal);
  };


  const closeModal = () => {
    setIsVisible(false);
    setSelectedItem(null);
  };

  const shareDiploma = () => {
    createAndSharePDF(selectedItem, dogName)
  };
  
  
  


  const renderItem = ({ item }) => {
    const date = item.get('date');
    const formattedDate = date
      ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
      : '';
    const badge = item.get('badge');
    const badgeIcon = badge ? <FontAwesome5 name={badge} size={70} color="#DAA520" style={{margin: 10,}}/> : null;

    return (
      <TouchableOpacity  style={styles.gridItem} onPress={() => { setSelectedItem(item); setIsVisible(true); }}>
          {badgeIcon}
          <Text style={styles.titleGrid}>{item.get('title')}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };


  return (<>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={readResults}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        refreshing={refreshing}
        ListEmptyComponent={() => <EmptyView text="Ingen merker tilgjengelige" />}  
        onRefresh={onRefresh}
        contentContainerStyle={styles.gridContainer}
      />
      <SystemModal isVisible={isVisible} closeModal={closeModal} backdrop={true} backdropToValue={1.0} celebration={true} onShare={shareDiploma} >
            {selectedItem && (
              <>
                <FontAwesome5 name={selectedItem.get('badge')} size={100} color="#DAA520" style={{margin: 10}}/>
                {imageUrl && (
              <Image
                style={[styles.image]} // Increased size
                source={{ uri: imageUrl }}
                cachePolicy={'disk'}
                blurRadius={5}
              />
            )}
                 
                    <Text style={styles.diplomaHeader}>Diplom</Text>
                    <Text style={styles.dividerText}>TILDELES</Text>
                    <Text style={styles.recipientName}>{dogName}</Text>
                    <Text style={styles.dividerText}>FOR</Text>
                    <Text style={styles.diplomaTitle}>{selectedItem.get('title')} </Text>
                    <Text style={styles.description}>{selectedItem.get('desc')}</Text>
    
                    <View style={styles.dateContainer} >
                         <Text style={styles.date}>{formatDateWithTime(selectedItem.get('date'))}</Text>
                    </View>
             
             
              </>
            )}
                <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteItem(selectedItem.id)}>
              <Text style={styles.deleteButtonText}>{localize('main.meta.deleteForever')}</Text>
            </TouchableOpacity>

           
      </SystemModal>
    </SafeAreaView>
      <ReusableBottomSheet
      sheetRef={bottomSheetRef}
      height={500}
      colors={{background: '#F9F9F9'}}
>
      <DogRewardForm dog={route.params?.id} close={closeSheet} />
    </ReusableBottomSheet>

 </> );

};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },

  titleGrid: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  image:{
    zIndex: -1,
    position: 'absolute',
    top: 0,
    left: 0,

    width: 400,
    height: 200,
    opacity: 0.4,
  },
  diplomaContainer: {
    backgroundColor: '#FAF3E0',
    padding: 20,
    alignItems: 'center',
  },
  diplomaHeader: {
    fontSize: 32,
    color: '#4E4E4E',
  },
  recipientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4E4E4E',
  },
  diplomaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E4E4E',
  },
  dividerText:{
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 30,
    color: '#4E4E4E',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'System',
    marginTop: 10,
    color: '#4E4E4E',
    textAlign: 'center',
  },
  dateContainer:{
    marginTop: 20,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 10,
  },
  date: {
    fontSize: 12,
    fontFamily: 'System',
    color: '#000',
  },
  gridContainer: {
    flex: 1,
    padding: 16,
  },
  gridItem: {
    flex: 1,
    margin: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  deleteButton: {
    width: 200,
    padding: 20,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  }
});

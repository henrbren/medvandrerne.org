import React, { memo, useState, useRef, useEffect , useCallback} from 'react';
import { SafeAreaView, Alert, View, TouchableOpacity, Text, StyleSheet, Modal, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import Parse from 'parse/react-native';
import Timeline from 'react-native-timeline-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { localize } from "@translations/localize";
import { formatDate } from '@components/helpers/DateUtils';  // adjust the import path as needed
import ImageView from 'react-native-image-viewing';

import LoadingModal from '@ui/LoadingModal';  // Import LoadingModal

import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Import ReusableBottomSheet


import { DogHistoryForm } from '@components/dogs/DogHistoryForm';

export const DogHistoryScreen = ({ route, navigation }) => {

  const bottomSheetRef = useRef(null);
 
  const dogId = route.params?.id;
  
  const [refreshing, setRefreshing] = useState(false);
  const [readResults, setReadResults] = useState([]);

  const [isGalleryVisible, setIsGalleryVisible] = useState(false); // State for gallery visibility
  const [historyImages, setHistoryImages] = useState([]); // State to hold fetched images
  const [isModalVisible, setIsModalVisible] = useState(false); // State for loading modal visibility

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await readDogData();
    setRefreshing(false);
  })

  useEffect(() => {
    readDogData();
  }, []);


  useEffect(() => {
    navigation.setOptions({
      title: localize('main.screens.dogDetail.history.title'),
      headerRight: () => (
        <TouchableOpacity onPress={showBottomSheet} style={{ marginRight: 15 }}>
                  <Ionicons name="add" size={30} color="black" />
        </TouchableOpacity>
      ),
    });

  }, [navigation]);



  const showBottomSheet = () => {
    bottomSheetRef.current.open();
  };

  const closeSheet = () => {
    bottomSheetRef.current.close();
    onRefresh();

  };

  const readDogData = async function () {
    setRefreshing(true);
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('dogHistory');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dogId);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.exists('title'); 
    parseQuery.descending('createdAt');
  
    try {
      let dogs = await parseQuery.find();
      const timeline = convertToTimelineData(dogs)
      setReadResults(timeline)
      setRefreshing(false);
      return true;
    } catch (error) {
      Alert.alert('Error!', error.message);
      setRefreshing(false);
      return false;
    }
  };
  
  // Konverter Parse-objekter til tidslinje-data
  const convertToTimelineData = (readResults) => {
    const icon = require('@assets/stickers/check.png'); 

    return readResults.map(item => ({
      key: item.id,
      time: formatDate(item.get('date')),
      title: item.get('title'),
      description: item.get('desc'),
      icon: icon, // Legg til flere ikoner etter behov
      hasImages: item.get('hasImages'),
    }));


  };



  const deleteItem = async (objectId, index) => {
   
    Alert.alert(
       localize('main.meta.deleteTitle'),
       localize('main.meta.deleteQuestion'),
      [
        {
          text:  localize('main.meta.cancel'),
          onPress: () => console.log('Cancel Pressed'), 
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const DogHistory = Parse.Object.extend('dogHistory');
            const query = new Parse.Query(DogHistory);
  
            try {
              const object = await query.get(objectId);
              await object.destroy();
              await readDogData();
             
            } catch (error) {
              Alert.alert(localize('main.meta.error'), error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderRightActions = useCallback((progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        onPress={() => deleteItem(item.key)}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteText}>{localize('main.meta.delete')}</Text>
      </TouchableOpacity>
    );
  })


  const fetchHistoryImages = async (historyKey) => {
    const HistoryImages = Parse.Object.extend('historyImages');
    const query = new Parse.Query(HistoryImages);
    query.equalTo('historyKey', historyKey);
  
    try {
      const fetchedImages = await query.find();
      if (fetchedImages.length > 0) { // Check if any images were fetched
        const images = fetchedImages.map(imageObj => ({
          uri: imageObj.get('image').url(),
        }));
        setHistoryImages(images);
        return true; // Return true to indicate that images were fetched
      } else {
        return false; // Return false if no images were found
      }
    } catch (error) {
      console.error('Error fetching history images:', error);
      return false; // Return false if an error occurs
    }
  };

  return (<>
    <SafeAreaView style={styles.container}>
      {isModalVisible ? (<LoadingModal />) : (<></>)}
        <Timeline
          data={readResults}
          options={{
            style: { paddingTop: 5 },
            refreshControl: (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            )
          }}
          circleSize={20}
          circleColor='grey' // Make the default circle invisible
          lineColor='grey' // iOS blue
          lineWidth={2} // You can adjust the line width
          descriptionStyle={{ color: 'gray' }}
          innerCircle={'dot'}
          isUsingFlatlist={true}
          showTime={false}
          renderDetail={(rowData, sectionID, rowID) => (
            
            <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, rowData)}
          >
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white', borderRadius: 8, padding: 10, marginRight: 10 }}>
              <Text style={{ fontWeight: '600' }}>{rowData.title}</Text>
              <Text style={{ color: 'gray' }}>{rowData.description}</Text>
              <Text style={{ color: 'gray' }}>{rowData.date}</Text>

              {rowData.hasImages ? (
                <TouchableOpacity
                  onPress={async () => {
                    setIsModalVisible(true);  // Show the modal
                    const success = await fetchHistoryImages(rowData.key);  // Fetch images
                    setIsModalVisible(false); 
                    if (success) {
                      setIsGalleryVisible(true);  // Open the gallery
                    }
                  }}
                  style={{ alignSelf: 'flex-end' }}
                >
                  <Text>Se bilder <FontAwesome5 name="arrow-right" size={14} /></Text>
                </TouchableOpacity>
              ) : (
                <></>
              )}
            </View>
            </Swipeable>
          )}
        
        />
  </SafeAreaView>

  <ReusableBottomSheet
          sheetRef={bottomSheetRef}
          height={600}
          colors={{background: '#F9F9F9'}}
      >
          <DogHistoryForm dog={route.params?.id} close={closeSheet} />
    </ReusableBottomSheet>

  <ImageView
    images={historyImages}
    imageIndex={0}
    visible={isGalleryVisible}
    onRequestClose={() => setIsGalleryVisible(false)}
  />
 

  </>);

};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Light Gray
  },
  deleteBtn: {
    height: '100%',
    width: 75,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D11A2A', // Red
    borderRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontFamily: 'System',
    fontWeight: '600',
  },
  // Additional styles for Timeline
  timelineItem: {
    backgroundColor: '#FFFFFF', // White
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timelineTitle: {
    color: '#333', // Dark Gray
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  timelineDescription: {
    color: '#777', // Gray
    fontSize: 14,
    fontFamily: 'System',
  },
  timelineTime: {
    color: '#007AFF', // iOS blue
    fontSize: 12,
    fontFamily: 'System',
  },
  // ... add more styles as needed
});
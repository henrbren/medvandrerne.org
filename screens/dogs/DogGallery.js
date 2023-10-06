import React, { useEffect, useState, useRef} from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import Parse from 'parse/react-native';
import ImageView from 'react-native-image-viewing';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Import ReusableBottomSheet
import { localize } from "@translations/localize";
import { DogHistoryForm } from '@components/dogs/DogHistoryForm';


import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent


export const DogGalleryScreen = ({ route, navigation }) => {

  const bottomSheetRef = useRef(null);
 
  const dogId = route.params?.id;

  const [images, setImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false); // State for gallery visibility
  
  useEffect(() => {
    fetchImages(); // Last inn bildene når komponenten monteres
  }, []);


  const fetchImages = async () => {
    //setRefreshing(true);
    const parseQuery = new Parse.Query('historyImages');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dogId);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.descending('createdAt');
  
    try {
      const fetchedImages = await parseQuery.find();
      const images = fetchedImages.map(imageObj => ({
        id: imageObj.id,
        uri: imageObj.get('image').url(), // Dette antar at det er en 'image' kolonne i dine Parse-objekter
        blurHash: imageObj.get('blurHash'),
      }));
      setImages(images);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching history images:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchImages();
  };

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
    onRefresh();
    bottomSheetRef.current.close();

  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={item => item.id}
        numColumns={3}
        ListEmptyComponent={<EmptyView text="Ingen bilder" isLoading={refreshing}  />}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => {
            setImageIndex(index);  // Update the index for the ImageViewer
            setIsGalleryVisible(true);
          }}>
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
              cachePolicy={'disk'}
              placeholder={item.blurHash}
              transition={500}
            />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ReusableBottomSheet
          sheetRef={bottomSheetRef}
          height={600}
          colors={{background: '#F9F9F9'}}
      >
          <DogHistoryForm dog={route.params?.id} close={closeSheet} />
    </ReusableBottomSheet>

      <ImageView
        images={images}
        imageIndex={imageIndex}
        visible={isGalleryVisible}
        onRequestClose={() => setIsGalleryVisible(false)}
      />
    </View>
  );


};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 1,
  },
  image: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    minWidth: 125,
    margin: 3,
    height: 100,
  },
});

import React, { memo, useState, useRef, useEffect } from 'react';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {
 StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions
} from 'react-native';
import DogHistoryTab from '@components/dogs/DogHistoryTab';  // Import the DogHistoryTab component
import DogGalleryTab from '@components/dogs/DogGalleryTab';  // Import the DogGalleryTab component (to be implemented)

import LoadingModal from '@components/helpers/LoadingModal';  // Import LoadingModal
import { localize } from "@translations/localize";

import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Import ReusableBottomSheet


import { DogHistoryForm } from '@components/dogs/DogHistoryForm';

export const DogHistoryScreen = ({ route, navigation }) => {
  const layout = useWindowDimensions();
  const bottomSheetRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dogId = route.params?.id;

  const [loadState, setLoadState] = useState(false);

  const [routes] = useState([
    { key: 'history', title: localize('main.screens.dogDetail.history.timeline') },
    { key: 'gallery', title:  localize('main.screens.dogDetail.history.gallery')},
  ]);


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


  const DogHistoryTabMemo = memo(DogHistoryTab);
  const DogGalleryTabMemo = memo(DogGalleryTab);

  const renderScene = SceneMap({
    history: () => <DogHistoryTabMemo  dogId={dogId} navigation={navigation} />,
    gallery: () => <DogGalleryTabMemo  dogId={dogId} navigation={navigation} />,
  });

  const showBottomSheet = () => {
    bottomSheetRef.current.open();
  };

  const closeSheet = () => {
    bottomSheetRef.current.close();

  };


  
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      activeColor="black"
      inactiveColor="gray"
    />
  );
  return (
    <>
      <TabView
      lazy  
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    <ReusableBottomSheet
          sheetRef={bottomSheetRef}
          height={600}
          colors={{background: '#F9F9F9'}}
      >
          <DogHistoryForm dog={route.params?.id} close={closeSheet} />
    </ReusableBottomSheet>
    <LoadingModal 
      isVisible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    />
    </>
  );
};


const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white', // iOS-like white background
    elevation: 0,  // remove shadow on Android
    shadowOpacity: 0,  // remove shadow on iOS
  },
  indicator: {
    backgroundColor: 'black',  // iOS-like black indicator
    height: 2,  // Thin indicator
  },
  label: {
    fontWeight: '500',  // Medium thickness
    fontSize: 14,  // Moderate size
    fontFamily: 'System',
    textTransform: 'none'  // Disable uppercase transformation
  },
  // ... (other styles)
});
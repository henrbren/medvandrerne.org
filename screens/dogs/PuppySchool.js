
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";

import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import SystemModal from '@ui/SystemModal';
import GuideModal from '@components/dogs/puppyGuide/GuideModal';

import data from '@assets/puppyGuide/valpeskole.json'; 

export const PuppySchoolScreen = ({ route, navigation }) => {

  navigator = useNavigation();

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);


 const [isVisible, setIsVisible] = useState(false);
 const [selectedItem, setSelectedItem] = useState(null);


 const weekIn = route.params.week;

 useEffect(() => {
  switch(weekIn) {
    case weekIn <= 8:
      setCurrentWeekIndex(0);
      break;
    case weekIn == 9:
      setCurrentWeekIndex(1);
      break;
    case weekIn == 10:
      setCurrentWeekIndex(2);
      break;
    case weekIn == 11:
      setCurrentWeekIndex(3);
      break;
    case weekIn == 12:
      setCurrentWeekIndex(4);
      break;
    case weekIn == 13:
      setCurrentWeekIndex(5);
      break;
     case weekIn == 14:
       setCurrentWeekIndex(6);
        break;
    default:
      setCurrentWeekIndex(0);
  }

}, [weekIn]);



 const handleNextWeek = () => {
  if (currentWeekIndex < data.length - 1) {
    setCurrentWeekIndex(currentWeekIndex + 1);
  }
};

const handlePreviousWeek = () => {
  if (currentWeekIndex > 0) {
    setCurrentWeekIndex(currentWeekIndex - 1);
  }
};

const currentWeekData = data[currentWeekIndex];
const weekKey = Object.keys(currentWeekData)[0];
const week = currentWeekData[weekKey];


  useEffect(() => {
    navigation.setOptions({
      title: localize('main.screens.dogDetail.puppySchool'),
    });
  }, [navigation]);


  const onSelectItem = (data) => {
    setSelectedItem(data)
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setSelectedItem(null);
  };

  
  return (<>
    <ScrollView style={styles.container}>
       
      <Text style={styles.weekTitle}>{week.title}</Text>
      <View style={styles.weekContainer}>
     
        {week.topics.map((topic, topicIndex) => (
          <TouchableOpacity key={topicIndex} style={styles.topicContainer} onPress={() => onSelectItem(topic)}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic?.description.substring(0, 85)}..</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        {currentWeekIndex != 0 && (
        <TouchableOpacity style={styles.prevButton} onPress={handlePreviousWeek}>
          <Text style={styles.prevButtonText}>Forrige uke</Text>
        </TouchableOpacity>)}
        <TouchableOpacity style={styles.nextButton} onPress={handleNextWeek}>
          <Text style={styles.nextButtonText}>Neste uke</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
    <SystemModal  isVisible={isVisible} closeModal={closeModal} backdrop={true} marginTop={90} >
            <GuideModal selectedItem={selectedItem}  />
        </SystemModal>

 </> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F0F1F6', // Lett grå bakgrunn

  },
  weekContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12, // Avrundede hjørner
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  weekTitle: {
    fontSize: 16,
    alignSelf: 'center',
    fontWeight: '600', // Semi-bold
    marginBottom: 12,
    marginTop: 12,
    color: '#333', // Nesten svart
  },
  topicContainer: {
    paddingVertical: 8, // Liten vertikal padding
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc', // Litt grå
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '500', // Medium
    color: '#111', // Nesten svart
  },
  topicDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#666', // Grå tekst for beskrivelse
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F0F1F6',
    marginBottom: 20,
  },
  prevButton: {
    flex: 1,
    backgroundColor: '#007AFF',  // Endre til din foretrukne farge
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#34C759',  // Endre til din foretrukne farge
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  prevButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


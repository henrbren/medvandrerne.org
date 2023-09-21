
import React, { useState, useEffect } from 'react';
import { Alert, View, SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";
import { FontAwesome5 } from '@expo/vector-icons';  // Import FontAwesome or any other icon library
import { Image } from 'expo-image';


import { formatDateWithTime, calculateDetailedAge, generateAgeString, calculateAgeInWeeks } from '@components/helpers/DateUtils';  // adjust the import path as needed


export const DogDetailScreen = ({ route, navigation }) => {
  const navigator = useNavigation();


  useEffect(() => {
    readDogData();
  }, []);


  // State variables
  const [readResults, setReadResults] = useState([]);
  const [dogName, setDogName] = useState('');

  const readDogData = async function () {
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('dogs');
    parseQuery.equalTo("objectId", route.params.id);


    try {
    let dog = await parseQuery.first();  // Use first instead of find
      // Be aware that empty or invalid queries return as an empty array
      // Set results to state variable
      if (dog) {
        setReadResults([dog]);  // Set the state to an array containing only this dog
        navigator.setOptions({ title: dog.get('title') });
        setDogName(dog.get('title'));
      }
      
      return true;
    } catch (error) {

      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  const goToHistory = () => {
   navigation.navigate('DogHistoryScreen', {id: route.params.id});
  };

  const goToRewards = () => {
    navigation.navigate('DogRewardsScreen', {id: route.params.id, dogName:dogName, imageUrl: readResults[0].get('profileImage').url()});
   };

   const goToTraining = () => {
    navigation.navigate('DogTrainingScreen', {id: route.params.id});
   };
   

  const goToFormals = () => {
    navigation.navigate('DogFormaliaScreen', {id: route.params.id});
   };
 


   const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#F8F8F8',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
    },
    text: {
      fontSize: 16,
      color: '#333',  // Dark gray
    },
  
    buttonIcon: {
      marginRight: 10,
      color: '#007AFF', // Apple's default button color
    },
    headerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 30,  // Increased padding
    },
    image: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    infoCard: {
      padding: 20,
      marginBottom: 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,  // Add a bottom border for each row
      borderColor: '#E0E0E0',  // Border color
      paddingTop: 12,
      paddingBottom: 12,
    },
    label: {
      fontSize: 18,
      fontWeight: '500',  // Slightly bold for the label
      color: '#333',
    },
    buttonCardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
    },
    buttonCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',  // Changed to 'flex-start' for left alignment
      padding: 20,
    },
    buttonIcon: {
      marginRight: 15,
      color: '#007AFF',  // Apple's default blue
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '500',
      flexShrink: 1,  // Allow the text to shrink if needed
    },
  });


    
  const renderDogDetails = (dog) => {
    const profileImageFile = dog.get('profileImage');
    const profileImageUrl = profileImageFile ? profileImageFile.url() : null;
    const dateOfBirth = dog.get('dateOfBirth');
    const age = calculateDetailedAge(dateOfBirth);
    const weeksOld = calculateAgeInWeeks(dateOfBirth);

    const ageString = weeksOld <= 16 ? generateAgeString(age) + ' ('+weeksOld + ' ' + localize("main.dates.weeks") +')' : generateAgeString(age);

    return (
      <View style={styles.container}>
      {/* Header Card */}
      <View style={[styles.card, styles.headerCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {profileImageUrl && (
              <Image
                style={[styles.image, { width: 80, height: 80, borderRadius: 40 }]} // Increased size
                source={{ uri: profileImageUrl }}
                cachePolicy={'disk'}
              />
            )}
            <View style={{ marginLeft: 20 }}>
              <Text style={[styles.title, { fontSize: 20, marginBottom: 5 }]}>{dog.get('title')} {dog.get('title')}</Text>
              <Text style={[styles.text, { fontSize: 16, fontWeight: '500' }]}>{dog.get('breed')}</Text>
            </View>
          </View>
        </View>

      {/* Information Cards */}
      <View style={styles.card}>
          <Text style={[styles.text, { fontWeight: '600', marginBottom: 10 }]}>{localize("main.screens.dogDetail.desc")}</Text>
          {dog.get('desc') ? (
            <Text style={[styles.text, { lineHeight: 24 }]}>{dog.get('desc')}</Text>
          ) : (
            <Text style={styles.text}>No description available.</Text>
          )}
        </View>


        
        <View style={styles.buttonCardContainer}>
               
               {/* History Button */}
               <TouchableOpacity 
                 style={[styles.card, styles.buttonCard, { marginRight: 10 }]} 
                 onPress={goToHistory}
               >
                 <FontAwesome5 name="history" size={24} style={styles.buttonIcon} />
                 <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showHistory")}</Text>
               </TouchableOpacity>
        
           {/* History Button */}
           <TouchableOpacity 
                 style={[styles.card, styles.buttonCard]} 
                 onPress={goToTraining}
               >
                 <FontAwesome5 name="paw" size={24} style={styles.buttonIcon} />
                 <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showTraining")}</Text>
               </TouchableOpacity>
        
           
     </View>

        <View style={styles.buttonCardContainer}>
                {/* Rewards Button */}
                <TouchableOpacity 
                  style={[styles.card, styles.buttonCard, { marginRight: 10 }]} 
                  onPress={goToRewards}
                >
                  <FontAwesome5 name="medal" size={24} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showRewards")}</Text>
                </TouchableOpacity>
                {/* Formals Button */}
                <TouchableOpacity 
                  style={[styles.card, styles.buttonCard]} 
                  onPress={goToFormals}
                >
                  <FontAwesome5 name="folder-open" size={24} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showFormals")}</Text>
                </TouchableOpacity>

                
        </View>

   

        <View style={styles.buttonCardContainer}>
            
                  <TouchableOpacity 
                    style={[styles.card, styles.buttonCard]} 
                    onPress={goToHistory}
                  >
                    <FontAwesome5 name="plus" size={24} style={[styles.buttonIcon, { color: '#FF0000' }]} />
                    <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showMedicine")}</Text>
                  </TouchableOpacity>
        </View>

        
        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.gender')}:</Text>
            <Text style={styles.text}>{dog.get('gender')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.age')}:</Text>
            <Text style={styles.text}>{ageString}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.kennel')}:</Text>
            <Text style={styles.text}>{dog.get('kennel')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.dateOfBirth')}:</Text>
            <Text style={styles.text}>{formatDateWithTime(dog.get('dateOfBirth'))}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.dateAquired')}:</Text>
            <Text style={styles.text}>{formatDateWithTime(dog.get('dateAcquired'))}</Text>
          </View>
        </View>

    
</View>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {readResults.length > 0 ? renderDogDetails(readResults[0]) : null}
      </ScrollView>
    </SafeAreaView>
  );



};


import React, { useState, useEffect } from 'react';
import { Alert, View, SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";
import { FontAwesome5 } from '@expo/vector-icons';


import UpdateProfileImage from '@parse/UpdateProfileImage'; 

import { formatDate, calculateDetailedAge, generateAgeString, calculateAgeInWeeks, isBirthdayOrHalfBirthday, generateAgeStringInYears } from '@components/helpers/DateUtils';  // adjust the import path as needed


export const DogDetailScreen = ({ route, navigation }) => {
  const navigator = useNavigation();


  useEffect(() => {
    readDogData();
  }, []);


  // State variables
  const [readResults, setReadResults] = useState([]);
  const [dogName, setDogName] = useState('');
  const [showDesc, setShowDesc] = useState(false);

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
        setDogName(dog.get('title') + ' ' + dog.get('lastname'));
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

  const goToGallery = () => {
    navigation.navigate('DogGalleryScreen', {id: route.params.id});
   };

  

  const goToRewards = () => {
    navigation.navigate('DogRewardsScreen', {id: route.params.id, dogName:dogName, imageUrl: readResults[0].get('profileImage').url()});
   };

   const goToTraining = () => {
    navigation.navigate('DogTrainingScreen', {id: route.params.id,  dogName:dogName, });
   };

   const goToMedicine= () => {
    navigation.navigate('DogHealthScreen', {id: route.params.id});
   };

   const goToPuppySchool = () => {
    navigation.navigate('PuppySchoolScreen', {id: route.params.id, week: calculateAgeInWeeks(readResults[0].get('dateOfBirth'))});
   };


   

  const goToFormals = () => {
    navigation.navigate('DogFormaliaScreen', {id: route.params.id});
   };
 


    
  const renderDogDetails = (dog) => {
    const profileImageFile = dog.get('profileImage');
    const profileImageUrl = profileImageFile ? profileImageFile.url() : null;
    const dateOfBirth = dog.get('dateOfBirth');
    const age = calculateDetailedAge(dateOfBirth);
    const weeksOld = calculateAgeInWeeks(dateOfBirth);
    const { isBirthday, isHalfBirthday } = isBirthdayOrHalfBirthday(dog.get('dateOfBirth'));

    const ageString = weeksOld <= 16 ? generateAgeString(age) + ' ('+weeksOld + ' ' + localize("main.dates.weeks") +')' : generateAgeString(age);

    const ageStringInYears = generateAgeStringInYears(dateOfBirth);



        
    return (
      <View style={styles.container}>
      {/* Header Card */}
      <View style={[styles.card, styles.headerCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {profileImageUrl && (
              <UpdateProfileImage parseClass="dogs" objectId={dog.id} profileImageUrl={profileImageUrl} />

            )}
            <View style={{ marginLeft: 20 }}>
              <Text style={[styles.title, { fontSize: 20, marginBottom: 5 }]}>{dog.get('title')} {dog.get('lastname')}</Text>
              <Text style={[styles.text, { fontSize: 16, fontWeight: '500' }]}>{dog.get('breed')}</Text>
            </View>
            
          </View>
        
        </View>

      {isBirthday &&  <View style={styles.card}>
          <Text style={[styles.text, { fontWeight: '600', marginBottom: 10 }]}>{dog.get('title')} {localize("main.screens.dogDetail.birthdayTitle")}</Text>
          <Text style={styles.text}>{localize("main.screens.dogDetail.birthdayDesc")} {ageStringInYears} {localize("main.screens.dogDetail.birthdayDesc2")}</Text>
        </View>}


      {/* Information Cards */}
  
        <View style={styles.buttonCardContainer}>
            
            <TouchableOpacity 
              style={[styles.card, styles.buttonCard]} 
              onPress={goToPuppySchool}
            >
              <FontAwesome5 name="paw" size={24} style={[styles.buttonIcon]} />
              <Text style={styles.buttonText}>{localize("main.screens.dogDetail.puppySchool")}</Text>
              <Text style={styles.weekInfo}>{localize("main.screens.dogDetail.week")} {weeksOld}</Text>
              
            </TouchableOpacity>
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
                 style={[styles.card, styles.buttonCard, ]} 
                 onPress={goToGallery}
               >
                 <FontAwesome5 name="images" size={24} style={styles.buttonIcon} />
                 <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showGallery")}</Text>
               </TouchableOpacity>
        
        
      
        
           
     </View>

        <View style={styles.buttonCardContainer}>

                <TouchableOpacity 
                  style={[styles.card, styles.buttonCard, { marginRight: 10 }]} 
                  onPress={goToRewards}
                >
                  <FontAwesome5 name="medal" size={24} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showRewards")}</Text>
                </TouchableOpacity>
               
                <TouchableOpacity 
                 style={[styles.card, styles.buttonCard]} 
                 onPress={goToTraining}
               >
                 <FontAwesome5 name="walking" size={24} style={styles.buttonIcon} />
                 <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showTraining")}</Text>
               </TouchableOpacity>

                
        </View>

   

        <View style={styles.buttonCardContainer}>
            
                  <TouchableOpacity 
                    style={[styles.card, styles.buttonCard]} 
                    onPress={goToMedicine}
                  >
                    <FontAwesome5 name="plus" size={24} style={[styles.buttonIcon, { color: '#FF0000' }]} />
                    <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showMedicine")}</Text>
                  </TouchableOpacity>
        </View>

        <View style={styles.card}>
        <TouchableOpacity onPress={() => setShowDesc(previousState => !previousState)}>
             <Text style={[styles.text, { fontWeight: '600',  }]}>{localize("main.screens.dogDetail.desc")}</Text>
             <FontAwesome5 name={showDesc ? "chevron-up" : "chevron-down"} size={18} style={[{ position: 'absolute', right: 0, top: 0 }]} />
        </TouchableOpacity>
            {showDesc &&  (
            <Text style={[styles.text, { lineHeight: 24 }]}>{dog.get('desc')}</Text>
                 )}
        </View>

        
        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.gender')}:</Text>
            <Text style={styles.text}>{dog.get('isFemale') ? 'Hunn' : 'Hann'}</Text>
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
            <Text style={styles.text}>{formatDate(dog.get('dateOfBirth'))}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.dateAquired')}:</Text>
            <Text style={styles.text}>{formatDate(dog.get('dateAcquired'))}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.text, styles.label]}>{localize('main.screens.dogDetail.formals.title')}:</Text>
                <TouchableOpacity  style={styles.text} onPress={goToFormals} >
                  <Text style={[styles.text, styles.label, {color: '#007AFF'}]}>{localize("main.screens.dogDetail.showFormals")}</Text>
                </TouchableOpacity>
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
  weekInfo:{
    fontSize: 12,
    color: '#333',  // Dark gray
    fontWeight: '600',
    marginLeft: 10,
    position: 'absolute',
    right: 15,
    top: 25,
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

import React, {useState, useEffect, useRef} from 'react';
import {
  Alert,
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Parse from 'parse/react-native';
import LottieView from 'lottie-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


import LoadingModal from '@ui/LoadingModal';
import { localize } from '@translations/localize';
import SystemModal from '@ui/SystemModal';
import * as FileSystem from 'expo-file-system';
import CameraView from "@components/helpers/camera/CameraView";
import { Image } from 'expo-image';

import Styles from '@styles/Main';
import { ScrollView } from 'react-native-gesture-handler';
import UpdateProfileImage from '@parse/UpdateProfileImage'; 

export const NewDog = () => {

  navigator = useNavigation();


  // State variables
  const [image, setImage] = useState('');
  const [newDogTitle, setNewDogTitle] = useState('');
  const [newDogLastName, setNewDogLastName] = useState('');
  const [newDogDesc, setNewDogDesc] = useState('');
  const [breed, setBreed] = useState('');

  const [kennel, setKennel] = useState('');
  const [nkkNumber, setNkkNumber] = useState('');
  const [isFemale, setIsFemale] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [dateOfAcquisition, setDateOfAcquisition] = useState(new Date());



  const lastNameRef = useRef(null);
  const descRef = useRef(null);
  const breedRef = useRef(null);
  const kennelRef = useRef(null);
  const nkkNumberRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [inputLayouts, setInputLayouts] = useState({});

  const handleLayout = (event, inputName) => {
    const layout = event.nativeEvent.layout.y;
    setInputLayouts(prevState => ({ ...prevState, [inputName]: layout }));
  };

  const handleFocus = (inputName) => {
    if (scrollViewRef.current && inputLayouts[inputName]) {
      scrollViewRef.current.scrollTo({ x: 0, y: inputLayouts + 50[inputName], animated: true });
    }
  };

  

  const [isVisible, setIsVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const closeModal = () => {
    setIsVisible(false);
   
  };

  const handleNextInput = (inputName) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 50, animated: true }); // Endre 50 til hvor mye du vil scrolle ned
    }
    if (this[inputName]) {
      this[inputName].focus();
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateOfBirth(selectedDate);
  
      // Lag en ny Date-instans basert på den valgte datoen
      const acquisitionDate = new Date(selectedDate);
      
      // Legg til 8 uker (56 dager) til den nye datoen
      acquisitionDate.setDate(acquisitionDate.getDate() + 56);
  
      setDateOfAcquisition(acquisitionDate);
    }
  };


  const onDateAQChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateOfAcquisition(selectedDate);
    }
  };

  // Functions used by the screen components
  const createNewAnimal = async function () {
    setIsUploading(true)
    // Creates a new Todo parse object instance
    let newAnimal = new Parse.Object('dogs');
    newAnimal.set('title', newDogTitle);
    newAnimal.set('lastname', newDogLastName);
    newAnimal.set('dateOfBirth', new Date(dateOfBirth));
    newAnimal.set('dateAcquired', new Date(dateOfAcquisition));
    newAnimal.set('desc', newDogDesc);
    newAnimal.set('breed', breed);
    newAnimal.set('kennel', kennel);
    newAnimal.set('registrationNumber', nkkNumber);

    newAnimal.set('owner', Parse.User.current());
    newAnimal.setACL(new Parse.ACL(Parse.User.current()))
    // After setting the todo values, save it on the server
    try {
      await newAnimal.save();

      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });

      const  parseFile = new  Parse.File('profile_image', {base64});
    
      // 2. Save the file
      try {
        const responseFile = await  parseFile.save();
        const parseClassInstance = Parse.Object.extend('dogs'); // e.g., parseClass is 'User'

        // Create an object with a specific objectId
        const object = parseClassInstance.createWithoutData(newAnimal.id); // replace objectId with the actual objectId
        
        console.log(newAnimal.id)
        
        // Set the new file
        object.set('profileImage', responseFile);
    
        await object.save();
        setIsUploading(false);
        navigator.navigate('DogDetailScreen', { id: newAnimal.id }) 
     
      } catch (error) {

          console.log(
            'The file either could not be read, or could not be saved to Back4app.',
          );
          console.log(error)
        }


      setIsUploading(false)


      return true;
    } catch (error) {
      setIsUploading(false)
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


  const  NewDogModal = () => {
    return (<SystemModal  isVisible={isVisible} closeModal={closeModal} backdrop={true} marginTop={200} >

                           <Text style={{fontSize: 20, marginBottom: 20, fontWeight: '600' }}>{localize('main.screens.newAnimal.title')}</Text>
                           <LottieView
                                          style={{ width: 400 }}
                                        source={require('@animations/dogs/disturb.json')}
                                        autoPlay
                                        loop={true}
                                      />
                           <Text style={{marginTop: 20, }}>{localize('main.screens.newAnimal.desc')}</Text>
                           <TouchableOpacity onPress={() => closeModal()} style={{marginTop: 20, backgroundColor: '#208AEC', padding: 20, width: 100, alignItems: 'center', borderRadius: 6}}>
                           <Text style={{ color: '#fff'}}>{localize('main.meta.start')}</Text>
                            </TouchableOpacity>
                </SystemModal>)
                }

  return (
    <>
    {!image ? (<CameraView setImage={setImage} image={image} modal={<NewDogModal />} />) : (

<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
          
           <View style={styles.wrapper}>
 
                <TouchableOpacity onPress={() => setImage(null)} style={styles.imageContainer}>

                                  {image !='none' ? (
                                                      <Image 
                                                              style={{width: '100%', height: 200, borderRadius: 6, backgroundColor: '#333'}} 
                                                              source={{uri: image}}
                                                              cachePolicy={'disk'}
  
                                                              />) : (<> 
                                                      <LottieView style={{width: '80%'}}  source={require('@animations/dogs/disturb.json')} autoPlay loop={true}   />
                                                      <Text style={Styles.selectImageText}>Trykk for å velge bilde</Text></>     
                                          )}
                            

                  </TouchableOpacity>

                        
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.title')}</Text>
                    <View onLayout={(event) => handleLayout(event, 'titleInput')}>
                    <TextInput
                      style={styles.input}
                      onFocus={() => handleFocus('titleInput')}
                      value={newDogTitle}
                      onChangeText={text => setNewDogTitle(text)}
                      onSubmitEditing={() => lastNameRef.current.focus()}
                      returnKeyType="next"
                    />
                    </View>
                   
                  </View>

                  <View style={styles.inputContainer}>
                  <View onLayout={(event) => handleLayout(event, 'lastNameInput')}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.lastname')}</Text>
                  
                    <TextInput
                      ref={lastNameRef}
                      style={styles.input}
                      value={newDogLastName}
                      onFocus={() => handleFocus('lastNameInput')}
                      onChangeText={text => setNewDogLastName(text)}
                      onSubmitEditing={() => descRef.current.focus()}
                      returnKeyType="next"
                    />
                      </View>
                  </View>

                  <View style={styles.inputContainer}>
                  <View onLayout={(event) => handleLayout(event, 'descInput')}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.desc')}</Text>
               
                        <TextInput
                          ref={descRef}
                          style={{ ...styles.input, height: 100 }}
                          value={newDogDesc}
                          onFocus={() => handleFocus('descInput')}
                          onChangeText={text => setNewDogDesc(text)}
                          onSubmitEditing={() => breedRef.current.focus()}
                          returnKeyType="next"
                          multiline={true}
                        />
                       </View>
                  </View>

                  <View style={styles.inputContainer}>
                  <View onLayout={(event) => handleLayout(event, 'breedInput')}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.rase')}</Text>
                   
                      <TextInput
                        ref={breedRef}
                        style={styles.input}
                        value={breed}
                        onFocus={() => handleFocus('breedInput')}
                        onChangeText={text => setBreed(text)}
                        onSubmitEditing={() => kennelRef.current.focus()}
                        returnKeyType="next"
                      />
                     </View>
                  </View>

                  <View style={styles.inputContainer}>
                  <View onLayout={(event) => handleLayout(event, 'kennelInput')}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.kennel')}</Text>
                   
                        <TextInput
                          ref={kennelRef}
                          style={styles.input}
                          value={kennel}
                          onFocus={() => handleFocus('kennelInput')}
                          onChangeText={text => setKennel(text)}
                          onSubmitEditing={() => nkkNumberRef.current.focus()}
                          returnKeyType="next"
                        />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                  <View onLayout={(event) => handleLayout(event, 'nkkInput')}>
                    <Text style={styles.label}>{localize('main.screens.newAnimal.form.nkkNumber')}</Text>
                  
                        <TextInput
                          ref={nkkNumberRef}
                          style={styles.input}
                          onFocus={() => handleFocus('nkkInput')}
                          value={nkkNumber}
                          onChangeText={text => setNkkNumber(text)}
                          returnKeyType="done"
                        />
                     </View>
                  </View>


              <View style={styles.inputContainer}>
                <Text style={styles.label}>{localize('main.screens.newAnimal.form.dateOfBirth')}</Text>
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="default"  // or "default"
                        onChange={onDateChange}
                        textColor='black'
                        placeholderText='Velg dato'
                        style={{  borderRadius: 12, color: 'black', marginBottom: 20}}
                      />
      
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{localize('main.screens.newAnimal.form.dateOfAcquisition')}</Text>
                <DateTimePicker
                        value={dateOfAcquisition}
                        mode="date"
                        display="default"  // or "default"
                        onChange={onDateAQChange}
                        textColor='black'
                        placeholderText='Velg dato'
                        style={{  borderRadius: 12, color: 'black', marginBottom: 20}}
                      />
           
              </View>



        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => createNewAnimal()}>
            <Text style={styles.buttonText}>{localize('main.screens.newAnimal.form.create')}</Text>
          </TouchableOpacity>
        </View>
        
        </View>
        <LoadingModal isVisible={isUploading} backgroundColor={'transparent'} onRequestClose={() => setIsUploading(false)} />
        </ScrollView>
</KeyboardAvoidingView>
   )}
  </> );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  wrapper: {
    padding: 20,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainer: {
    marginTop: 20,
  },
  selectImageText:{
    color: '#333',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#208AEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
});


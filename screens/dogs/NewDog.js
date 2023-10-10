import React, {useState, useEffect} from 'react';
import {
  Alert,
  View,
  SafeAreaView,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Parse from 'parse/react-native';
import LottieView from 'lottie-react-native';

import {
  List,
  Title,
  IconButton,
  Text as PaperText,
  Button as PaperButton,
  TextInput as PaperTextInput,
} from 'react-native-paper';

import { localize } from '@translations/localize';
import SystemModal from '@ui/SystemModal';
import CameraView from "@components/helpers/camera/CameraView";


import Styles from '@styles/Main';
import { ScrollView } from 'react-native-gesture-handler';

export const NewDog = () => {

  navigator = useNavigation();


  // State variables
  const [image, setImage] = useState('');
  const [newDogTitle, setNewDogTitle] = useState('');
  const [newDogDesc, setNewDogDesc] = useState('');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [isVisible, setIsVisible] = useState(true);

  const closeModal = () => {
    setIsVisible(false);
   
  };



  // Functions used by the screen components
  const createDog = async function () {
    // Creates a new Todo parse object instance
    let Dog = new Parse.Object('dogs');
    Dog.set('title', newDogTitle);
    Dog.set('lastname', newDogTitle);
    Dog.set('dateOfBirth', new Date(dateOfBirth));
    Dog.set('desc', newDogDesc);
    Dog.set('breed', breed);
    Dog.set('done', false);
    Dog.set('owner', Parse.User.current());
    Dog.setACL(new Parse.ACL(Parse.User.current()))
    // After setting the todo values, save it on the server
    try {
      await Dog.save();
      // Success
      Alert.alert('Lagret!', 'Oppgave lagret.');
      navigator.navigate('DogNavigator');
      // Refresh todos list to show the new one (you will create this function later)

      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

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

        <ScrollView  style={styles.container}>
       <View style={styles.wrapper}>
 
         <View style={styles.imageContainer}>
          {image ? (<Image style={{width: '100%', height: 200, borderRadius: 6}} source={{uri: image}} />) : (<> 
           <LottieView style={{width: '100%'}}  source={require('@animations/imageSelect.json')} autoPlay loop={true}   />
                <Text style={Styles.selectImageText}>Trykk for å velge bilde</Text></>)}
              
        </View>

                      <View style={styles.inputContainer}>
                <Text style={styles.label}>Tittel</Text>
                <TextInput
                  style={styles.input}
                  value={newDogTitle}
                  onChangeText={text => setNewDogTitle(text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Oppgave</Text>
                <TextInput
                  style={{ ...styles.input, height: 100 }}
                  value={newDogDesc}
                  onChangeText={text => setNewDogDesc(text)}
                  multiline={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Rase</Text>
                <TextInput
                  style={styles.input}
                  value={breed}
                  onChangeText={text => setBreed(text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fødselsdato</Text>
                <TextInput
                  style={styles.input}
                  value={dateOfBirth}
                  onChangeText={text => setDateOfBirth(text)}
                />
              </View>


        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => createDog()}>
            <Text style={styles.buttonText}>Opprett</Text>
          </TouchableOpacity>
        </View>
        
        </View>
        </ScrollView>
     
   )}
  </> );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  wrapper: {
    padding: 20,
  },
  imageContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 20,
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


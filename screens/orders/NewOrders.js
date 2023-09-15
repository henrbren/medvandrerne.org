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

import CameraView from "@components/helpers/camera/CameraView";

import Styles from '@styles/Main';

export const NewOrders = () => {

  navigator = useNavigation();

  const [username, setUsername] = useState('');

  useEffect(() => {
    // Since the async method Parse.User.currentAsync is needed to
    // retrieve the current user data, you need to declare an async
    // function here and call it afterwards
    async function getCurrentUser() {
      // This condition ensures that username is updated only if needed
      if (username === '') {
        const currentUser = await Parse.User.currentAsync();
        if (currentUser !== null) {
          setUsername(currentUser.getUsername());
        }
      }
    }
    getCurrentUser();
  }, [username]);


  // State variables
  const [image, setImage] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');

  // Functions used by the screen components
  const createMeasure = async function () {
    // Creates a new Todo parse object instance
    let Measure = new Parse.Object('LaserJob');
    Measure.set('title', newJobTitle);
    Measure.set('desc', newJobDesc);
    Measure.set('done', false);
    Measure.set('owner', Parse.User.current());
    Measure.setACL(new Parse.ACL(Parse.User.current()))
    // After setting the todo values, save it on the server
    try {
      await Measure.save();
      // Success
      Alert.alert('Lagret!', 'Oppgave lagret.');
      navigator.navigate('OrdersTab');
      // Refresh todos list to show the new one (you will create this function later)

      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };


  return (
    <>
    {!image ? (<CameraView setImage={setImage} image={image} />) : (


      <SafeAreaView style={Styles.container}>
        <View style={Styles.wrapper}>

        <View style={{backgroundColor: '#f2f2f2', borderRadius: 6}}>
          {image ? (<Image style={{width: '100%', height: 200, borderRadius: 6}} source={{uri: image}} />) : (<> 
           <LottieView style={{width: '100%'}}  source={require('@animations/imageSelect.json')} autoPlay loop={true}   />
                <Text style={Styles.selectImageText}>Trykk for å velge bilde</Text></>)}
              
        </View>

          <View style={Styles.create_todo_container}>
            {/* Todo create text input */}
            <PaperTextInput
              value={newJobTitle}
            
              onChangeText={text => setNewJobTitle(text)}
              label="Tittel"
              mode="outlined"
              style={Styles.create_todo_input}
            />
          </View>
        <View style={Styles.create_todo_container}>

                  <PaperTextInput
                    value={newJobDesc}
                    onChangeText={text => setNewJobDesc(text)}
                    label="Oppgave"
                    multiline={true}
                    mode="outlined"
                    style={Styles.create_todo_input_desc}
                  />

          </View>
          <View style={Styles.create_todo_container}>
                      {/* Todo create button */}
                      <PaperButton
                        onPress={() => createMeasure()} 
                        icon="plus"
                        mode="outlined"

                        color={'#208AEC'}
                        style={Styles.create_todo_button}>
                        {'Opprett '}
                      </PaperButton>
          </View>
        
        </View>
      </SafeAreaView>
   )}
  </> );
};


import React, {useState, useEffect} from 'react';
import {
  Alert,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text
} from 'react-native';
import Parse from 'parse/react-native';
import {
  List,
  Title,
  IconButton,
  Text as PaperText,
  Button as PaperButton,
  TextInput as PaperTextInput,
} from 'react-native-paper';

import { FontAwesome5 } from '@expo/vector-icons'; 


import { localize } from '@translations/localize';
import Styles from '@styles/Main';
import { useNavigation } from '@react-navigation/native';

export const OrdersScreen = () => {

  navigator = useNavigation();
  navigator.setOptions({ title: 'Ordre' })

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
    readMeasures();
  }, [username]);


  // State variables
  const [readResults, setReadResults] = useState([]);
  console.log(readResults)


  const readMeasures = async function () {
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('LaserJob');
    try {
      let todos = await parseQuery.find();

      // Be aware that empty or invalid queries return as an empty array
      // Set results to state variable
      setReadResults(todos);
      return true;
    } catch (error) {

      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  const updateMeasure = async function (todoId, done) {
    // Create a new todo parse object instance and set todo id
    let Job = new Parse.Object('LaserJob');
        Job.set('objectId', todoId);
        // Set new done value and save Parse Object changes
        Job.set('done', done);
        try {
          await Job.save();
          // Success
          Alert.alert('Success!', 'Todo updated!');
          // Refresh todos list
          readMeasures();
          return true;
        } catch (error) {
          // Error can be caused by lack of Internet connection
          Alert.alert('Error!', error.message);
          return false;
        };
  };

  const deleteTodo = async function (todoId) {
    // Create a new todo parse object instance and set todo id
    let Measure = new Parse.Object('LaserJob');
    Measure.set('objectId', todoId);
    // .destroy should be called to delete a parse object
    try {
      await Measure.destroy();
      Alert.alert('Avbestilt!', 'Jobb avbestilt');
      // Refresh todos list to remove this one
      readMeasures();
      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  return (      <>
      <SafeAreaView style={Styles.container}>
          <ScrollView>
                {/* Todo read results list */}
                {readResults !== null &&
                  readResults !== undefined &&
                  readResults.map((todo) => (<View  style={Styles.todo_item_container}>
                     <TouchableOpacity  style={Styles.todo_item}>
                  
                        <Text style={Styles.todo_text_header}>{todo.get('title')}</Text>
                        <Text style={Styles.todo_text}>{todo.get('desc')}</Text>
                           {/* Todo update button */}
                           {todo.get('done') !== true && (
                            <TouchableOpacity style={Styles.todo_update_button} onPress={() => updateMeasure(todo.id, true)}>
                                 <FontAwesome5 name="check" size={16} color={"#4CAF50"} />
                            </TouchableOpacity>
                          )}

                          {todo.get('delivered') !== false && (
                        
                          <TouchableOpacity onPress={() => deleteTodo(todo.id)} style={Styles.todo_update_button}>
                               <FontAwesome5 name="trash-alt" size={16} color={"#ef5350"} />
                          </TouchableOpacity>
                                       )}
    

                     </TouchableOpacity>

                  </View>
                  ))}
          </ScrollView>
      </SafeAreaView>

 </> );
};

// These define the screen component styles
const Styless = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  wrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#208AEC',
  },
  header_logo: {
    width: 170,
    height: 40,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  header_text_bold: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header_text: {
    marginTop: 3,
    color: '#fff',
    fontSize: 14,
  },
  flex_between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  create_todo_container: {
    flexDirection: 'row',
  },
  create_todo_input: {
    flex: 1,
    height: 38,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  create_todo_button: {
    marginTop: 6,
    marginLeft: 15,
    height: 40,
  },
  todo_item: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  todo_text: {
    fontSize: 15,
  },
  todo_text_done: {
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
});
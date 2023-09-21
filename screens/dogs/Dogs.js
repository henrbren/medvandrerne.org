import React, {useState, useEffect} from 'react';
import {
  Alert,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import Parse from 'parse/react-native';

import { Image } from 'expo-image';

import { FontAwesome5 } from '@expo/vector-icons'; 
import { localize } from '@translations/localize';

import { useNavigation } from '@react-navigation/native';

export const DogsScreen = () => {

  const navigator = useNavigation();
  const [readResults, setReadResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    readMeasures();
  }, []);

  const readMeasures = async () => {
    setRefreshing(true);
    const parseQuery = new Parse.Query('dogs');
    try {
      const todos = await parseQuery.find();
      setReadResults(todos);
      setRefreshing(false);
    } catch (error) {
      Alert.alert('Error!', error.message);
      setRefreshing(false);
    }
  };


  const renderItem = ({ item }) => {
    const profileImageFile = item.get('profileImage');
    const profileImageUrl = profileImageFile ? profileImageFile.url() : null;

    return (
      <TouchableOpacity 
        style={Styles.todo_item} 
        onPress={() => { navigator.navigate('DogDetailScreen', { id: item.id }) }}
      >
        <View style={Styles.todo_item_content}>
          {profileImageUrl && (
            <Image
              source={{ uri: profileImageUrl }}
              style={Styles.profileImage}
              cachePolicy={'disk'}
            />
          )}
          <View>
            <Text style={Styles.list_text_header}>{item.get('title')} {item.get('lastname')}</Text>
            <Text style={Styles.list_text}>{item.get('breed')}</Text>
          </View>
        </View>
        <FontAwesome5 name="chevron-right" style={Styles.list_arrow} size={22} color={"#333"} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={Styles.container}>
      <FlatList
        data={readResults}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={readMeasures}
          />
        }
      />
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  todo_item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  todo_item_content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,  // Increased from 40
    height: 80,  // Increased from 40
    borderRadius: 40,  // Increased from 20
    marginRight: 16,  // Increased from 10
  },
  list_text_header: {
    fontSize: 16,
    fontWeight: '600',
  },
  list_text: {
    fontSize: 14,
    color: '#333',
  },
  list_arrow: {
    color: '#C7C7CC',
  },
});

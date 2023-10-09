import React, {useState, useEffect, useMemo} from 'react';
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
import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import { useNavigation } from '@react-navigation/native';
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent

export const DogsScreen = () => {

  const navigator = useNavigation();
  const [readResults, setReadResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    readMeasures();
    console.log('DogsScreen useEffect')
  }, []);

  const readMeasures = async () => {
    setRefreshing(true);
    const parseQuery = new Parse.Query('dogs');
    try {
      const animals = await parseQuery.find();

    
      if (animals.length >= 2) {
        navigator.setOptions({ title: localize('main.screens.dogs.tabMultiple') })
      }


      setReadResults(animals);
      setRefreshing(false);
    } catch (error) {
      Alert.alert('Error!', error.message);
      setRefreshing(false);
    }
  };

  const filteredResults = useMemo(() => {
    return readResults.filter(item => {
      const title = item.get('title').toLowerCase();
      const lastname = item.get('lastname').toLowerCase();
      const breed = item.get('breed').toLowerCase();
      const query = searchQuery.toLowerCase();
  
      return title.includes(query) || lastname.includes(query) || breed.includes(query);
    });
  }, [readResults, searchQuery]);

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
        data={filteredResults}
        renderItem={renderItem}
        ListEmptyComponent={() => <EmptyView text={localize('main.screens.dogs.noDogs')} />}  
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={readMeasures}
          />
        }
      />
      <SearchFieldAccessory searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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

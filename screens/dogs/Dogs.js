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
import { Ionicons } from '@expo/vector-icons';  // We switch to Ionicons for a more iOS-native feel
import checkForUpdates from '@components/helpers/UpdatesChecker';  // Husk å importere riktig
import * as Haptics from 'expo-haptics';
import BadgeList from '@parse/BadgeList';  // Husk å importere BadgeList


import { localize } from '@translations/localize';
import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import { useNavigation } from '@react-navigation/native';
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent

export const DogsScreen = () => {

  const navigator = useNavigation();
  const [readResults, setReadResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBadges, setShowBadges] = useState(false);



  useEffect(() => {
    readMeasures();
    checkForUpdates()
    
  }, []);

  const readMeasures = async () => {
    setRefreshing(true);
    const parseQuery = new Parse.Query('dogs');
    try {
      const animals = await parseQuery.find();

    
      if (animals.length >= 2) {
        navigator.setOptions({ title: localize('main.screens.dogs.tabMultiple') })
      }

      if (animals.length == 0) {
        navigator.navigate('NewAnimalNavigator')
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
        onLongPress={() => { 
          setShowBadges(true)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        onPress={() => { 
          navigator.navigate('DogDetailScreen', { id: item.id })
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      >
                {profileImageUrl && (
            <Image
              source={{ uri: profileImageUrl }}
              style={Styles.profileImage}
              cachePolicy={'disk'}
            />
          )}
        <View style={Styles.todo_item_content}>
  
          <View>
            <Text style={Styles.list_text_header}>{item.get('title')} {item.get('lastname')}</Text>
            <Text style={Styles.list_text}>{item.get('breed')}</Text>
            {showBadges && (<BadgeList id={item.id} />)}
          </View>
        </View>
        <Ionicons name="ios-chevron-forward" style={Styles.list_arrow} size={22} color={"#333"} />
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
    backgroundColor: '#F8F8F8',  // Pure white backgroun
  },
  todo_item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  todo_item_content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,

  },
  list_text_header: {
    fontSize: 17,  // A bit larger for readability
    fontWeight: '500',  // Semibold
  },
  list_text: {
    fontSize: 15,  // A bit larger for readability
    color: '#8E8E93',  // Secondary label color for iOS
  },
  list_arrow: {
    color: '#8E8E93',  // Secondary label color for iOS
    position: 'absolute',
    right: 20,

    
  },
});

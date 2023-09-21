import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet,InputAccessoryView } from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { localize } from "@translations/localize";

const SearchFieldAccessory = ({ searchQuery, setSearchQuery }) => {

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const inputAccessoryViewID = 'dogTraining';

  return (<>
        <View style={styles.searchBarContainer}>
                <FontAwesome5 name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchBar}
                  placeholder={localize('main.meta.search')}
                  placeholderTextColor="#8E8E93"
                  value={searchQuery}
                  inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                    <FontAwesome5 name="times" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
          </View>
     
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
              <View style={styles.searchBarContainer}>
                <FontAwesome5 name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchBar}
                  placeholder={localize('main.meta.search')}
                  placeholderTextColor="#8E8E93"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                    <FontAwesome5 name="times" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
          </View>
        </InputAccessoryView>
      )}
</>);
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    margin: 10,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 40,  // make room for the search icon
    fontSize: 17,
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: 8,
  },
});

export default SearchFieldAccessory;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';


const WeightListItem = ({ item, onSelect, onDelete }) => {
  const date = item.get('date');
  const formattedDate = date ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : '';

  const displayDogWeight = (weightInGrams) => {
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toFixed(2)} kg`;
    } else {
      return `${weightInGrams} g`;
    }
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity style={styles.deleteBox} onPress={onDelete}>
        <FontAwesome5 name="trash" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity 
        style={styles.listItem} 
        onPress={onSelect}
        activeOpacity={0.7}
      >

        <View style={styles.textContainer}>
          <Text style={styles.title}>{displayDogWeight(item.get('weight'))}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 0.5,
        borderBottomColor: '#C7C7CC',
      },
      iconContainer: {
        alignItems: 'center',
        marginRight: 16, // add some spacing between the icon and the text
      },
      textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      },
      deleteBox: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
      },
      title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
      },
      description: {
        fontSize: 14,
        color: '#333',
      },
});

export default WeightListItem;

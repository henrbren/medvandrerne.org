import React, { useEffect, useState } from 'react';
import {
  Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import Parse from 'parse/react-native';

import LoadingModal from '@components/helpers/LoadingModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { localize } from "@translations/localize";

export const DogRewardForm = ({dog, close}) => {

  const [formData, setFormData] = useState({ title: '', desc: '', badge: 'medal', date: new Date() });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Convert to your desired format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('date', selectedDate);
    }
  };
  
  // Functions used by the screen components
  const createDogReward = async function () {
    // Creates a new Todo parse object instance
    let DogHistory = new Parse.Object('dogRewards');
    DogHistory.set('title', formData.title);
    DogHistory.set('desc', formData.desc);
    DogHistory.set('badge', formData.badge);
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);

    let dateForm = new Date(formData.date);
    DogHistory.set('date', dateForm)
    const hasImages = selectedImages.length > 0 ? true : false;
    console.log(hasImages)
    DogHistory.set('dogOwner', dogPointer);
    DogHistory.set('owner', Parse.User.current());
    DogHistory.setACL(new Parse.ACL(Parse.User.current()))
    // After setting the todo values, save it on the server
    try {
      await DogHistory.save();
     close()
      // Refresh todos list to show the new one (you will create this function later)

      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };


  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>{localize('main.screens.dogDetail.rewards.createReward')}</Text>
      <InputField
        value={formData.title}
        onChange={(value) => handleChange('title', value)}
        placeholder={localize('main.screens.dogDetail.rewards.form.title')}
      />
      <InputField
        value={formData.desc}
        onChange={(value) => handleChange('desc', value)}
        placeholder={localize('main.screens.dogDetail.rewards.form.description')}
        multiline
      />
        <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"  // or "default"
            onChange={onDateChange}
            textColor='black'
            placeholderText={localize('main.screens.dogDetail.rewards.form.date')}
            style={{  borderRadius: 12, color: 'black', marginBottom: 20}}
          />
      <ActionButton text={localize('main.screens.dogDetail.rewards.form.create')}  onPress={createDogReward} />
      <ActionButton text={localize('main.screens.dogDetail.rewards.form.close')} textColor="black" onPress={close} style={styles.closeButton} />
      <LoadingModal isVisible={isUploading} onRequestClose={() => setIsUploading(false)} />
    </View>
  );
};

const InputField = ({ value, onChange, placeholder, multiline }) => (
  <TextInput
    value={value}
    onChangeText={onChange}
    placeholder={placeholder}
    placeholderTextColor="#777"
    style={[styles.input, multiline && { height: 100 }]}
    multiline={multiline}
  />
);

const ActionButton = ({ text, onPress, style, textColor = '#fff' }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, {color: textColor}]}>{text}</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F9F9F9',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'System',
    color: '#333',  // Text color
   
  },
  button: {
    backgroundColor: '#007AFF',  // Apple blue
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',  // White text
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  closeButton: {
    backgroundColor: '#E0E0E0',  // Light gray
  },
});




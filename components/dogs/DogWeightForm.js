import React, { useEffect, useState } from 'react';
import {
  Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import Parse from 'parse/react-native';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from '@ui/LoadingModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { localize } from "@translations/localize";

import getMedicineIconName from './medicine/getMedicineIconName';

export const DogWeightForm = ({dog, close}) => {

  const [formData, setFormData] = useState({ weight: '', date: new Date() });
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
 
  const handleChange = (field, value) => {
    let newValue = parseFloat(value);
  
    // Sjekk om verdien er et nummer, en punktum, eller et tomt felt
    if (!isNaN(newValue) || value === "") {
      if (value === "") {
        newValue = '';  // Setter til null hvis feltet er tomt
      }
      // Oppdaterer formData
      setFormData({ ...formData, [field]: newValue });
      setStatusText('');
    } else {
      setStatusText("Vennligst skriv inn et nummer");
    }
  };

  const handleDate = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Convert to your desired format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleDate('date', selectedDate);
    }
  };
  
  // Functions used by the screen components
  const createDogReward = async function () {
    setIsUploading(true);
    // Creates a new Todo parse object instance
    let DogHistory = new Parse.Object('dogWeight');
    DogHistory.set('weight', formData.weight);
    DogHistory.set('desc', formData.desc);

    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);
    let dateForm = new Date(formData.date);
    DogHistory.set('date', dateForm)

    DogHistory.set('dogOwner', dogPointer);
    DogHistory.set('owner', Parse.User.current());

    // After setting the todo values, save it on the server
    try {
      await DogHistory.save();
      setIsUploading(false);
      close()
    
      // Refresh todos list to show the new one (you will create this function later)

      return true;
    } catch (error) {
      setIsUploading(false);
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };


  return (
    <View style={styles.container}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>{localize('main.screens.dogDetail.medicine.createEntry')}</Text>

          <InputField
              value={String(formData.weight)}  // Konverterer til streng
              onChange={(value) => handleChange('weight', value)}
              placeholder={localize('main.screens.dogDetail.medicine.form.weight')}
              keyboardType="numeric"
            />

          <Text>{statusText}</Text>
        <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"  // or "default"
            onChange={onDateChange}
            textColor='black'
            placeholderText='Velg dato'
            style={{  borderRadius: 12, color: 'black', marginBottom: 20}}
          />
      <ActionButton text="Opprett"  onPress={createDogReward} />
      <ActionButton text="Lukk" textColor="black" onPress={close} style={styles.closeButton} />
      <LoadingModal isVisible={isUploading} backgroundColor={'transparent'} onRequestClose={() => setIsUploading(false)} />
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
  pickerContainer: {
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    height: 130,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden'
  },
  picker: {
    height: 130,
    width: '100%',
    marginTop: -50,
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

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imageButton: {
    backgroundColor: '#E0E0E0',  // Apple blue
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  customButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    backgroundColor: '#E0E0E0',  // Light gray
  },
});




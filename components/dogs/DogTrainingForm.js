import React, { useEffect, useState } from 'react';
import {
  Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import Parse from 'parse/react-native';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from '@components/helpers/LoadingModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import getActivityIconName from './training/getActivityIconName';
import { localize } from "@translations/localize";

export const DogTrainingForm = ({dog, close}) => {

  const [formData, setFormData] = useState({ title: '', desc: '', badge: 'dog', trainingType: 'BasicPuppy', date: new Date() });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTrainingType, setSelectedTrainingType] = useState('Basic');


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
    let DogHistory = new Parse.Object('dogTraining');
    DogHistory.set('title', formData.title);
    DogHistory.set('desc', formData.desc);
    DogHistory.set('badge', getActivityIconName(formData.trainingType));
    DogHistory.set('trainingType', formData.trainingType);

    console.log(getActivityIconName(formData.badge))
    
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);

    let dateForm = new Date(formData.date);
    DogHistory.set('date', dateForm)

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
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>{localize('main.screens.dogDetail.training.createTraining')}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTrainingType}
          moxde="dialog"
          onValueChange={(itemValue) => {
            setSelectedTrainingType(itemValue);
            handleChange('trainingType', itemValue);
          }}
          style={styles.picker}
        >
       <Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.BasicPuppy')} value="BasicPuppy" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.HouseTraining')} value="HouseTraining" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.Socialization')} value="Socialization" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.BasicObedience')} value="BasicObedience" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.RecallTraining')} value="RecallTraining" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.LeashWalking')} value="LeashWalking" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.SitStay')} value="SitStay" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.DownStay')} value="DownStay" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.StandStay')} value="StandStay" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.HandSignals')} value="HandSignals" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.ClickerTraining')} value="ClickerTraining" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.Agility')} value="Agility" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.Tracking')} value="Tracking" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.NoseWork')} value="NoseWork" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.RallyObedience')} value="RallyObedience" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.FreestyleTricks')} value="FreestyleTricks" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.WaterRescue')} value="WaterRescue" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.TherapyDog')} value="TherapyDog" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.GuardProtection')} value="GuardProtection" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.HuntTraining')} value="HuntTraining" />
<Picker.Item label={localize('main.screens.dogDetail.training.trainingTypes.AdvancedObedience')} value="AdvancedObedience" />

          {/* Add more training types here */}
        </Picker>
      </View>
      <InputField
        value={formData.title}
        onChange={(value) => handleChange('title', value)}
        placeholder={localize('main.screens.dogDetail.training.form.title')}
      />
      <InputField
        value={formData.desc}
        onChange={(value) => handleChange('desc', value)}
        placeholder={localize('main.screens.dogDetail.training.form.description')}
        multiline
      />
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




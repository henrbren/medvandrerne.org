import React, { useEffect, useState } from 'react';
import {
  Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import Parse from 'parse/react-native';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from '@ui/LoadingModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { localize } from "@translations/localize";

export const DogHistoryForm = ({dog, close}) => {

  const [formData, setFormData] = useState({ title: null, desc: null, date: new Date()  });
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
  


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3,
    });
  
    // Using "canceled" instead of "cancelled"
    if (!result.canceled) {
      // Accessing the "assets" array instead of "uri"
      const asset = result.assets[0];
      setSelectedImages([...selectedImages, asset.uri]);
    }
  };

  
  const uploadImages = async (historyKey) => {
    setIsUploading(true);
    for (let uri of selectedImages) {
      let fileName = uri.split('/').pop();
    
      // Convert image to base64
      let base64Img = await uriToBase64(uri);
  
      let parseFile = new Parse.File(fileName, { base64: base64Img });

      let HistoryImage = new Parse.Object('historyImages');
      HistoryImage.set('image', parseFile);
      const historyPointer = Parse.Object.extend('dogHistory').createWithoutData(historyKey);
      HistoryImage.set('historyKey', historyPointer);
      HistoryImage.set('owner', Parse.User.current());
      const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);

      HistoryImage.set('dogOwner', dogPointer);

      try {
        await HistoryImage.save();
        setIsUploading(false);
      } catch (error) {
        Alert.alert('Error!', 'Error uploading image: ' + error.message);
        setIsUploading(false);
      }
    }
  };

  const uriToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert URI to base64'));
      };
      reader.readAsDataURL(blob);
    });
  };

  // Functions used by the screen components
  const createDogHistory = async function () {
    // Creates a new Todo parse object instance
    let DogHistory = new Parse.Object('dogHistory');
    DogHistory.set('title', formData.title);
    DogHistory.set('desc', formData.desc);
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);

    let dateForm = new Date(formData.date);
    DogHistory.set('date', dateForm)
    const hasImages = selectedImages.length > 0 ? true : false;
    console.log(hasImages)
    DogHistory.set('hasImages', hasImages);
    DogHistory.set('dogOwner', dogPointer);
    DogHistory.set('owner', Parse.User.current());
    //DogHistory.setACL(new Parse.ACL(Parse.User.current()))
    // After setting the todo values, save it on the server
    try {
      await DogHistory.save();
      await uploadImages(DogHistory.id);
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
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>{localize('main.screens.dogDetail.history.createHistory')}</Text>
      <ImagePickerButton  onPress={() => pickImage(setSelectedImages)} />
      <ImageGrid images={selectedImages} />
      <InputField
        value={formData.title}
        onChange={(value) => handleChange('title', value)}
        placeholder={localize('main.screens.dogDetail.history.form.title')}
      />
      <InputField
        value={formData.desc}
        onChange={(value) => handleChange('desc', value)}
        placeholder={localize('main.screens.dogDetail.history.form.description')}
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
     <ActionButton text={localize('main.screens.dogDetail.history.form.create')}   onPress={createDogHistory} />
     <ActionButton text={localize('main.screens.dogDetail.history.form.close')} textColor="black" onPress={close} style={styles.closeButton} />
     <LoadingModal isVisible={isUploading} backgroundColor={'transparent'} onRequestClose={() => setIsUploading(false)} />
    </View>
  );
};

// Sub Components
const ImagePickerButton = ({ onPress }) => (
  <TouchableOpacity style={styles.imageButton} onPress={onPress}>
    <Text style={styles.customButtonText}>Legg til bilder +</Text>
  </TouchableOpacity>
);

const ImageGrid = ({ images }) => (
  <View style={styles.imageGrid}>
    {images.map((image, index) => (
      <View style={styles.imageContainer} key={index}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>
    ))}
  </View>
);

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




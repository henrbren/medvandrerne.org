import React, { useEffect, useState } from 'react';
import {
  Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import Parse from 'parse/react-native';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from '@ui/LoadingModal';

import { localize } from "@translations/localize";

import * as DocumentPicker from 'expo-document-picker';

export const DocumentForm = ({dog, close}) => {


  const [fileSize, setFileSize] = useState(0);
  const [selectedFilename, setSelectedFilename] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [isUploading, setIsUploading] = useState(false);


  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf', // Generell filtype
      copyToCacheDirectory: true,
    });
    


    if (result.assets[0].name) {
      let fileName = result.assets[0].name.split('/').pop();

      setSelectedFilename(fileName);
      setFileSize(result.assets[0].size)
      setSelectedDocument(result.assets[0].uri);
    }
  };
  
  
  const uploadDocument = async () => {
    setIsUploading(true);
    
    let fileName = selectedDocument.split('/').pop();
    const fileExtension = selectedDocument.split('.').pop();

    
    // Convert document to base64
    let base64Doc = await uriToBase64(selectedDocument);
  
    let parseFile = new Parse.File(fileName, { base64: base64Doc });
  
    let HistoryDocument = new Parse.Object('dogDocuments');
    HistoryDocument.set('document', parseFile);
    HistoryDocument.set('title', selectedFilename);
    HistoryDocument.set('size', fileSize);
    
    
    HistoryDocument.set('owner', Parse.User.current());
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(dog);
    
    HistoryDocument.set('dogOwner', dogPointer);
  
    try {
      await HistoryDocument.save();
      setIsUploading(false);
    } catch (error) {
      Alert.alert('Error!', 'Error uploading document: ' + error.message);
      setIsUploading(false);
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
  const createDocument = async function () {
    try {
      await uploadDocument();
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
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>{localize('main.screens.dogDetail.documents.form.create')}</Text>
      
      <ImagePickerButton  onPress={() => pickDocument()} />
              <View style={styles.imageGrid}>
          

          {selectedDocument && (
          <View style={styles.fileContainer}>
                  <Text>{selectedFilename}</Text>
          </View>)}

        </View>


   
   {selectedDocument && (<>
      {fileSize <= 18000000 ?  (
         <ActionButton text={localize('main.screens.dogDetail.documents.form.upload')} onPress={createDocument} />
         ) : (
        <Text style={styles.tooLargeText}>
        {localize('main.screens.dogDetail.documents.form.tooLarge')}</Text>)}
        </>)}

   
     <ActionButton text={localize('main.screens.dogDetail.documents.form.close')} textColor="black" onPress={close} style={styles.closeButton} />
     <LoadingModal isVisible={isUploading} backgroundColor={'transparent'} onRequestClose={() => setIsUploading(false)} />
    </View>
  );
};

// Sub Components
const ImagePickerButton = ({ onPress }) => (
  <TouchableOpacity style={styles.imageButton} onPress={onPress}>
    <Text style={styles.customButtonText}>{localize('main.screens.dogDetail.documents.form.add')} </Text>
  </TouchableOpacity>
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
  tooLargeText: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#FF3B30',
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
  fileContainer: {
    backgroundColor: '#E0E0E0',  // Apple blue
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
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




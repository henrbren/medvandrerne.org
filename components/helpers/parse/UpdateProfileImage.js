import React, { useState, useEffect } from 'react';

import { TouchableOpacity, Text } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import Parse from 'parse/react-native';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';

import LoadingModal from '@ui/LoadingModal';  // Import LoadingModal
import * as Haptics from 'expo-haptics';


const UpdateProfileImage = ({ parseClass, objectId, profileImageUrl, showActionSheetWithOptions }) => {
    const [imageUrl, setImageUrl] = useState(profileImageUrl);
    const [isUploading, setIsUploading] = useState(false);

  const onImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const options = ['Ta bilde', 'Velg fra galleri', 'Avbryt'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async buttonIndex => {
        if (buttonIndex < 2) {
          // Spør om tillatelser før du åpner ImagePicker
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            alert('Beklager, vi trenger kamerarulle tillatelser for å gjøre dette!');
            return;
          }
        }

        let result;
        switch (buttonIndex) {
          case 0: // Ta bilde
            result = await ImagePicker.launchCameraAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.3, // Sett kvaliteten på bildet til 50%
                size: 1024 * 1024 * 2, // Sett maks størrelse til 2MB
            });
            break;
          case 1: // Velg fra galleri
            result = await ImagePicker.launchImageLibraryAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.3, // Sett kvaliteten på bildet til 50%
              size: 1024 * 1024 * 2, // Sett maks størrelse til 2MB
            });
            break;
        }

        if (result && !result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setImageUrl(asset.uri);
            setIsUploading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  
            const base64 = asset.base64 || (await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' }));

              const  parseFile = new  Parse.File(asset.fileName, {base64});
            
              // 2. Save the file
              try {
                const responseFile = await  parseFile.save();
                const parseClassInstance = Parse.Object.extend(parseClass); // e.g., parseClass is 'User'

                // Create an object with a specific objectId
                const object = parseClassInstance.createWithoutData(objectId); // replace objectId with the actual objectId
                
                // Set the new file
                object.set('profileImage', responseFile);
            
                await object.save();
                setIsUploading(false);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
              } catch (error) {
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
                  console.log(
                    'The file either could not be read, or could not be saved to Back4app.',
                  );
                  console.log(error)
                }

        }
      },
    );
  };

  return (<>
    <TouchableOpacity onPress={onImagePress}>
      {imageUrl ? (
        <Image style={{ width: 80, height: 80, borderRadius: 12 }} source={{ uri: imageUrl }} cachePolicy={'disk'} />
      ) : (
        <Text>Legg til profilbilde</Text>
      )}
    </TouchableOpacity>
      <LoadingModal text={"Laster opp.."} isVisible={isUploading} backgroundColor={'transparent'} onRequestClose={() => setIsUploading(false)} />
      </>
  );
};

export default connectActionSheet(UpdateProfileImage);

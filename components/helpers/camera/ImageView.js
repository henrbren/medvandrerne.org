import { useState, useRef, useEffect} from 'react';
import { Pressable, TouchableOpacity, Text, View, Image, KeyboardAvoidingView, TextInput, ActivityIndicator } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

import { showMessage, hideMessage } from "react-native-flash-message";
import { FontAwesome5 } from "@expo/vector-icons";
import useStyle from './styles';
import { localize } from "@translations/localize";

import EmojiList from "./EmojiList";
import EmojiPicker from "./EmojiPicker";
import EmojiSticker from "./EmojiSticker";


export default function ImageView({ imageUri, setImage, setImageUri }) {

  const imageRef = useRef();

    const [status, requestPermission] = MediaLibrary.usePermissions();

    const [showStickerOptions, setShowStickerOptions] = useState(false);
    const [localImageUri, setLocalImageUri] = useState();
    const [text, setText] = useState();
    const [loadingOcr, setLoadingOcr] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pickedEmoji, setPickedEmoji] = useState(null);
    const styles = useStyle(); 


    const onAddSticker = () => {
        setIsModalVisible(true);
      };
    
      const onModalClose = () => {
        setIsModalVisible(false);
      };
    
      const resetImage = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setImageUri()
        setPickedEmoji(null)
      }



      const onSetImageAsync = async () => {
        try {
          const localUri = await captureRef(imageRef, {        
            height: 440,
            quality: 1,
          });
    
          if (localUri) {
            setImage(localUri)
          }
        } catch (e) {
          console.log(e);
        }
      };

      const onSaveImageAsync = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        
        if (status === null) {
          requestPermission();
        }

        try {
          const localUri = await captureRef(imageRef, {        
            height: 440,
            quality: 1,
          });
    
          await MediaLibrary.saveToLibraryAsync(localUri);      
          if (localUri) {

            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
             )

            showMessage({
              message: localize("main.screens.newWorkOrder.savedToDisk"),
              backgroundColor: "#2F4A9F",
            });
          }
        } catch (e) {
          console.log(e);
        }
      };

      useEffect(() => {
        //analyzeImage() Run OCR on image. To be used?
    }, [imageUri]);


  return (<>
                    <Pressable onLongPress={onAddSticker}>
                            <View ref={imageRef} collapsable={false}>
                            
                                <Image style={styles.imagePreview} source={{ uri: imageUri }} />
                                {pickedEmoji !== null ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> : null}
                               
                          
                            </View>
                    </Pressable>
         
                              <View  style={styles.buttonContainer}>
                                      <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >
                                                <TouchableOpacity style={styles.button} onPress={resetImage}>
                                                            <Text style={styles.text}>
                                                                <FontAwesome5  name="redo" size={20} color="#fff" />
                                                            </Text>
                                                </TouchableOpacity>           
                                    </BlurView>

                                    <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >
                                                <TouchableOpacity style={styles.button} onPress={onSaveImageAsync}>
                                                            <Text style={styles.text}>
                                                                <FontAwesome5  name="download" size={20} color="#fff" />
                                                            </Text>
                                                </TouchableOpacity>           
                                    </BlurView>

                               
                            </View>

                            <View style={[styles.pictureButton]} >
                                      <TouchableOpacity style={[styles.button]} onPress={onSetImageAsync}>
                                                            <Text style={styles.text}>
                                                                <FontAwesome5  name="arrow-right" size={30} color="#385e9e" />
                                                            </Text>
                                                </TouchableOpacity>             
                                    </View>

            

                            <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                                 <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
                            </EmojiPicker>
                            
            </>);
}

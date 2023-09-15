import { useState, useRef, useEffect} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from "@expo/vector-icons";

import { localize } from "@translations/localize";
import { CameraErrorView, EmptyCameraView } from "@components/helpers/LoadingUI";

import LottieView from 'lottie-react-native';

import useStyle from './styles';

export default function TakePicture({ setImageUri, setPermission }) {

    const cameraRef = useRef(null);
    const animation = useRef(null);
    const styles = useStyle(); 

    const [type, setType] = useState(CameraType.back);
    const [flashMode, setFlashMode] = useState(FlashMode.off);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [permission, requestPermission] = Camera.useCameraPermissions();

    if (!permission)  return (<View />);
    if (!permission.granted)  return (<CameraErrorView permissions={requestPermission()} onClick={() => setPermission('none')} message={localize('main.screens.camera.noAccessContextAo')} />);

     const toggleCameraType = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
      }
    
      const toggleFlashMode = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setFlashMode(current => (current === FlashMode.off ? FlashMode.torch : FlashMode.off));
      }
    
      const setDubbleZoom = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setZoomLevel(current => (current === 0 ? 0.01 : 0));
      }

      const pickImage = async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                
                // No permissions request is necessary for launching the image library
                let result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.All,
                        allowsEditing: true,
                        quality: 1,
                });
            
            
                if (!result.canceled) {
                Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                )
                setImageUri(result.assets[0].uri);
             
                }
      };
    
      const takePicture = async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            
                await cameraRef.current.takePictureAsync().then((picture) => {
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                )
                    console.log(picture)
                    setImageUri(picture.uri)
               
                
                })
       
      }
    
  
  return (<Camera style={styles.camera}
                    type={type}
                    flashMode={flashMode}
                    zoom={zoomLevel}
                    ref={cameraRef}>

        <TouchableOpacity style={styles.skipButton} onPress={() => setPermission('none')}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name="times" size={40} color="#fff" />
                                </Text>
        </TouchableOpacity>


        <View  style={styles.buttonContainer}>
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >
                    <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name="retweet" size={20} color="#fff" />
                                </Text>
                    </TouchableOpacity>
            </BlurView>
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >
                    <TouchableOpacity style={styles.button} onPress={toggleFlashMode}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name="lightbulb" size={20} color={flashMode == FlashMode.off ? "#fff" : "orange"} />
                                </Text>
                    </TouchableOpacity>
                </BlurView>
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >        
                    <TouchableOpacity style={styles.button} onPress={setDubbleZoom}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name={zoomLevel ? "search-minus" : "search-plus"} size={20} color="#fff" />
                                </Text>
                    </TouchableOpacity>
                </BlurView>
        </View>

        <View  style={styles.pictureButton}>
        
                    <TouchableOpacity style={[styles.button]} onPress={takePicture}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name="camera" size={30} color="#385e9e" />
                                </Text>
                    </TouchableOpacity>
          
        </View>
        <View  style={styles.pickerButton}>
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur} >
                    <TouchableOpacity style={[styles.button]} onPress={pickImage}>
                                <Text style={styles.text}>
                                    <FontAwesome5  name="image" size={20} color="#fff" />
                                </Text>
                    </TouchableOpacity>
            </BlurView>
        </View>


       

</Camera>
  );
}


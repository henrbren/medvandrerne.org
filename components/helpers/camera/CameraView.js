

import { useState, useEffect} from 'react';
import { View } from 'react-native';

import TakePicture from "./TakePicture";
import ImageView from "./ImageView";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function CameraView({
    image, 
    setImage,
    modal
}) {

  const [imageUri, setImageUri] = useState();
  const [permission, setPermission] = useState(null);

  useEffect(() => {
      if(permission=='none'){
        setImage('none')
      }
  }, [permission]);

  return (<GestureHandlerRootView>
                         {modal}
                         {imageUri ? (
                          <ImageView imageUri={imageUri} setImage={setImage} setImageUri={setImageUri} />) : (
                         <TakePicture setImageUri={setImageUri} setPermission={setPermission} />)}
            </ GestureHandlerRootView>
  );
}


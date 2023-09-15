import { View } from "react-native";
import LottieView from 'lottie-react-native';

export default LoadingAppView = ({ title, message }) => {
  return (
      <View style={{paddingTop: 20, padding:10, marginLeft: 20,  alignItems: 'center',backgroundColor: "#fff"}} >
           <LottieView style={{width: 130, marginTop: '50%'}} source={require('@animations/loading.json')} autoPlay  />
        </View>
  );
};
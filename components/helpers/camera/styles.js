import { StyleSheet, useWindowDimensions, Platform} from 'react-native';

export default useStyle = () => {

    const { height, width } = useWindowDimensions();
    
    const tabbarHeight = Platform.OS == 'ios' ? 95: 80
    const heightMinusTabBar = height - tabbarHeight
    
    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: '#fff'},
      camera: { height: heightMinusTabBar, backgroundColor: '#fff' },
      buttonContainer: { 
        position: 'absolute', 
        top: 30,
        right: 0,
        width: 80,
        paddingBottom: 20

     },
     pickerButton:{
          position: 'absolute', 
          bottom: 20,
          left: 20,
          width: 80,
          paddingBottom: 20,
     },
     pictureButton: { 
         backgroundColor: '#fff',
         borderRadius: 50,
         marginBottom: 30,
         marginRight: 20,
          position: 'absolute', 
          bottom: 20,
          right: 20,
          width: 90,
          height: 90,
          paddingTop: 15,
     },

     pictureButtonGo: { 
      backgroundColor: '#fff',
      borderRadius: 50,
      marginBottom: 30,
      marginRight: 20,
       position: 'absolute', 
        top: height - 260,
       right: 20,
       width: 90,
       height: 90,
       paddingTop: 15,
  },
     buttonBlur:{
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'gray',
        margin: 10,
     },
     imagePreview: {
        height: heightMinusTabBar,
        width: width,
        resizeMode:'contain'
     },
      button: {  margin: 5 },
      skipButton:{
        position: 'absolute',
        left: 20,
        top: 30
      },
      input:{
        height: height,
        color: '#fff',
        backgroundColor:  'gray',
        width: width,


      },
      text: { 
        padding: 10,
        textAlign: 'center'
    },
  
    });
    return styles ;
  };
  
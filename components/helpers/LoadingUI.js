import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Text } from "react-native";

import { useTheme } from '@react-navigation/native';

import {localize, initLanguage} from '@translations/localize';


const { width, height } = Dimensions.get("window");



const CameraErrorView = ({ message, onClick, askAgain }) => {

  const { colors } = useTheme();


  const [loading, setLoading] = useState(false);

  _handleRefetch = () => {
    setLoading(true)
    onClick()
  };


  return (
    <View style={{height: '100%', backgroundColor: colors.background}} >
  
    <View style={styles.errorView}>
      <Text style={styles.errorViewTitle}>{localize('main.screens.camera.noAccess')}</Text> 


      { message && message.includes("JSON") ? (<> 
              <Text style={styles.errorMessageHeader}>Vi får ikke riktige data fra serveren</Text>
         </>):(<>
            <Text style={styles.errorMessageHeader}>{localize('main.screens.camera.noAccessContext')}</Text>
            <Text style={styles.errorMessage}>{message}</Text>
          </>)}


    </View>

    {onClick ? (
      <TouchableOpacity  onPress={_handleRefetch}  style={styles.button}>
                      <Text style={styles.buttonText}>
                        {localize("main.meta.forward")}
                      </Text>
                  
      </TouchableOpacity>
      ) : (<></>)}


   </View>

  );
};

    

const styles = StyleSheet.create({
    container:{
        alignItems:'center',
  
        flex: 1
      },
      containerDark:{
        alignItems:'center',
        backgroundColor: '#000',
        flex: 1,
      },
      containerDark:{
        alignItems:'center',
        backgroundColor: '#000',
        flex: 1,
      },
      errorMessageHeader: {
       
        fontSize: 14, 
        width: '100%',
        paddingTop: 12, 
      
      },
    errorMessage: {
        paddingTop: 10,
        fontSize: 15, 
      
        color: "#2F4A9F"
      },
      errorView:{  
      backgroundColor: "#EBEDF6",
      borderRadius: 10,
      borderColor: "#EBEDF6",
      margin:20,
      padding:20,
      width: '90%',
      borderWidth: 1,

    },
    errorViewTitle: {
      fontSize: 20, 
      paddingTop: 10, 
      paddingBottom:10,

      fontWeight: 'bold',
      color: '#2F4A9F',
    },
      smallError:{
        color:'red', 
        paddingTop: 15, 
        paddingBottom: 15, 
        paddingLeft:10, 
        borderColor: '#ccc', 
        borderWidth: 1, 
        borderRadius: 6, 
        marginTop: 10, 
        marginBottom: 10
      },
      viewTitle: {
        fontSize: 20, 
        paddingTop: 30, 
        paddingBottom:30,
        fontWeight: 'bold',
        color: '#2F4A9F',
      },
      activity:{
        position: 'absolute',
        right: 20,
        top: 18,
      },
      button:{
        backgroundColor: "#2F4A9F",
        borderRadius: 10,
        borderColor: "#2F4A9F",
        margin:20,
        padding:20,
        width: '90%',
        borderWidth: 1,
      },
      buttonText: {
        textAlign: "center",
        fontSize: 15, 
      
        color: "#fff"
      },
      smallViewTitle: {
        position: 'absolute',
        top: 20,
        fontWeight: 'bold',
        color: '#2F4A9F',
        fontSize: 20, 
        paddingTop:5, 
        paddingBottom:30 
      },
      image: {
        paddingTop:30,
        width: 300,
        height: 300,
        resizeMode: 'contain',
      },
     
     
});

export {

    CameraErrorView,
    
  }
import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItem, } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { localize } from '@translations/localize';
import { Ionicons } from "@expo/vector-icons";

import { useDrawerStatus } from '@react-navigation/drawer';
  
export function MenuItems(props){
    const navigation = useNavigation();

    const [service, setService] = useState("");

    useEffect(() => {

            bootstrapAsync();
    
      }, [useDrawerStatus()]);

      const bootstrapAsync = async () => {

            let serviceStore;
  
            try {
              serviceStore = await SecureStore.getItemAsync("service");
            } catch (e) {
              // Restoring token failed
            }
            
            if(serviceStore){
              setService(serviceStore.split(','))
           
            }
         
      }
      

      return (
        <View style={styles.mainMenu}>
              
              
        <Text style={{ paddingLeft: 10, paddingBottom: 20, textAlign: "left", fontSize: 16, color: "#2A334A", marginTop: 10 }} > laserHenrik</Text>
      
        <DrawerItem
                                        label={localize('main.navigation.home')}
                                        onPress={() => { navigation.navigate('TabNavigator'); }}
                                        icon={({ focused, color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />}
                                    />
        
        
  
    </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingLeft: 10,
        height: 90,

    },
    space: {
        height: 350,
        paddingTop: 100,
        backgroundColor: '#fff',
        color: '#2a334a',

    },

    container: {
        flex: 1,

    },
    mainMenu: {
        paddingLeft: 20,
        marginTop: -20

    },


});
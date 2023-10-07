import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItem, } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { localize } from '@translations/localize';
import { FontAwesome5 } from '@expo/vector-icons';

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
              
              

                           <DrawerItem
                                        label={localize('main.navigation.menu.home')}
                                        onPress={() => { navigation.navigate('DogNavigator'); }}
                                        icon={({ focused, color, size }) => <FontAwesome5 name={"dog"} size={size} color={color}/>}
                                    />

                                <DrawerItem
                                        label={localize('main.navigation.menu.aiChat')}
                                        onPress={() => { navigation.navigate('ChatNavigator'); }}
                                        icon={({ focused, color, size }) => <FontAwesome5 name={"robot"} size={size} color={color}/>}
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
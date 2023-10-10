
import {createDrawerNavigator} from "@react-navigation/drawer";
import Icon from 'react-native-vector-icons/Ionicons';


import { NavigationContainer } from "@react-navigation/native";
//Screenstack
import { DrawerContent } from "@components/Menu";
import { TabNavigator } from '@navigators/TabNavigator';

import { DogNavigator } from "@navigators/DogNavigator";
import { ChatNavigator } from "@navigators/ChatNavigator";
import { NewAnimalNavigator } from "@navigators/NewAnimalNavigator";

import { StatusBar } from 'expo-status-bar';

//icons
import { FontAwesome } from '@expo/vector-icons'; 

//Navigator
export function MainNavigator({ navigation }) {

    let initialRouteName = 'DogNavigator'
    const Drawer = createDrawerNavigator();

    return (
      
        <NavigationContainer>
            <StatusBar style="dark" />
                <Drawer.Navigator initialRouteName={initialRouteName}
                screenOptions={{ headerShown: false,   swipeEdgeWidth: 0,  }}
                drawerContent={(props) => <DrawerContent {...props} />}
                >


            <Drawer.Screen
                    name="DogNavigator"
                    options={{ 
                        title: 'Hund' ,
                      }}
                    component={DogNavigator}
                
                />

          <Drawer.Screen
                    name="NewAnimalNavigator"
                    options={{ 
                        
                        title: 'Hund' ,
                      }}
                    component={NewAnimalNavigator}
                
                />

            <Drawer.Screen
                    name="ChatNavigator"
                    options={{ 
                        
                        title: 'Hund' ,
                      }}
                    component={ChatNavigator}
                
                />

                

            
            </Drawer.Navigator>
      </NavigationContainer>
    )
}
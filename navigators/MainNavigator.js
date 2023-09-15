
import {createDrawerNavigator} from "@react-navigation/drawer";
import Icon from 'react-native-vector-icons/Ionicons';


import { NavigationContainer } from "@react-navigation/native";
//Screenstack
import { DrawerContent } from "@components/Menu";
import { TabNavigator } from '@navigators/TabNavigator';

//icons
import { FontAwesome } from '@expo/vector-icons'; 

//Navigator
export function MainNavigator({ navigation }) {

    let initialRouteName = 'TabNavigator'
    const Drawer = createDrawerNavigator();

    return (
        <NavigationContainer>
                <Drawer.Navigator initialRouteName={initialRouteName}
                screenOptions={{ headerShown: true,   swipeEdgeWidth: 0,  }}
                drawerContent={(props) => <DrawerContent {...props} />}
                >

                <Drawer.Screen
                    name="TabNavigator"
                    options={{ 
                        title: 'Ordre' ,
                      }}
                    component={TabNavigator}
                
                />

            
            </Drawer.Navigator>
      </NavigationContainer>
    )
}
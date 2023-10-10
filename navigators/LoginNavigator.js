import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Screenstack
import { UserLoginScreen } from "@screens/login/UserLoginScreen";
import { UserRegistrationScreen } from "@screens/login/UserRegistrationScreen";
import { UserLoginEmailScreen } from "@screens/login/UserLoginEmailScreen";


//Navigator
export function LoginNavigator({ navigation }) {

    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UserLoginScreen">
            
                <Stack.Screen
                    name="UserLoginScreen"
                    component={UserLoginScreen}
                    options={{
                        headerShown: false,
                       
                        // When logging out, a pop animation feels intuitive
                        // You can remove this if you want the default 'push' animation
                        animationTypeForReplace: 'pop',
                    }}
                />

<Stack.Screen
                    name="UserLoginEmailScreen"
                    component={UserLoginEmailScreen}
                    options={{
                        headerShown: false,
                       
                        // When logging out, a pop animation feels intuitive
                        // You can remove this if you want the default 'push' animation
                        animationTypeForReplace: 'pop',
                    }}
                />

                <Stack.Screen
                    name="UserRegistrationScreen"
                    component={UserRegistrationScreen}
                    options={{
                        headerShown: false,
                        presentation: 'modal',
                    }}
                />

            
            </Stack.Navigator>
        </NavigationContainer>
    )
}
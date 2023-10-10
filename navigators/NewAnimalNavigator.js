import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { localize } from "@translations/localize";
import { navigationHeader } from "@styles/navigation";

import { useTheme } from '@react-navigation/native';

//Icons
import { FontAwesome } from "@expo/vector-icons";

import { NewDog } from "@screens/dogs/NewDog";


//Navigator
export function NewAnimalNavigator({ route, navigation }) {
  const Stack = createNativeStackNavigator();

  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={navigationHeader}>
      <Stack.Screen
        name="NewDog"
        component={NewDog}
        options={{
          headerTitleAlign: "center",
          title: localize("main.screens.dogChat.title"),
          headerStyle: {
            backgroundColor: colors.card
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <FontAwesome
              backgroundColor={colors.background}
              color={colors.text}
              name="bars"
              size={24}
              onPress={() => navigation.openDrawer()}
            ></FontAwesome>
          ),
          /*headerRight: () => (
                                    <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                ),*/
        }}
      />



    </Stack.Navigator>


  );
}

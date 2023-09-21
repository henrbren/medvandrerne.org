import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

import { localize } from "@translations/localize";
import { navigationHeader } from "@styles/navigation";

import { useTheme } from '@react-navigation/native';

//Icons
import { FontAwesome } from "@expo/vector-icons";
import { DogsScreen } from "@screens/dogs/Dogs";
import { DogDetailScreen } from "@screens/dogs/DogDetail";
import { DogHistoryScreen } from "@screens/dogs/DogHistory";
import { DogFormaliaScreen } from "@screens/dogs/DogFormalia";
import { DogRewardsScreen } from "@screens/dogs/DogRewards";
import { DogTrainingScreen } from "@screens/dogs/DogTraining";


//Navigator
export function DogNavigator({ route, navigation }) {
  const Stack = createNativeStackNavigator();

  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={navigationHeader}>
      <Stack.Screen
        name="DogsScreen"
        component={DogsScreen}
        options={{
          headerTitleAlign: "center",
          title: localize("main.screens.dogs.title"),
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

    <Stack.Screen
        name="DogDetailScreen"
        component={DogDetailScreen}
        options={{
          headerTitleAlign: "center",
          title: localize("main.screens.dogs.title"),
          headerStyle: {
            backgroundColor: colors.card
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <FontAwesome
              backgroundColor={colors.card}
              color={colors.text}
              name="chevron-left"
              size={24}
              onPress={() => navigation.goBack()}
            ></FontAwesome>
          ),
          /*headerRight: () => (
                                    <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                ),*/
        }}
      />

      <Stack.Screen
              name="DogHistoryScreen"
              component={DogHistoryScreen}
              options={{
                headerTitleAlign: "center",
                title: localize("main.screens.dogs.title"),
                headerStyle: {
                  backgroundColor: colors.card
                },
                headerTintColor: colors.text,
              
                /*headerRight: () => (
                                          <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                      ),*/
              }}
            />

        <Stack.Screen
              name="DogFormaliaScreen"
              component={DogFormaliaScreen}
              options={{
                presentation: "modal",
                headerTitleAlign: "center",
                title: localize("main.screens.dogDetail.formals.title"),
                headerStyle: {
                  backgroundColor: colors.card
                },
                headerTintColor: colors.text,
                headerRight: () => (
                  <FontAwesome
                    backgroundColor={colors.card}
                    color={colors.text}
                    name="times"
                    size={24}
                    onPress={() => navigation.goBack()}
                  ></FontAwesome>
                ),
                /*headerRight: () => (
                                          <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                      ),*/
              }}
            />

        <Stack.Screen
              name="DogRewardsScreen"
              component={DogRewardsScreen}
              options={{
                headerTitleAlign: "center",
                title: localize("main.screens.dogs.title"),
                headerStyle: {
                  backgroundColor: colors.card
                },
                headerTintColor: colors.text,
            
                /*headerRight: () => (
                                          <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                      ),*/
              }}
            />

          <Stack.Screen
              name="DogTrainingScreen"
              component={DogTrainingScreen}
              options={{
                headerTitleAlign: "center",
                title: localize("main.screens.dogs.title"),
                headerStyle: {
                  backgroundColor: colors.card
                },
                headerTintColor: colors.text,
            
                /*headerRight: () => (
                                          <FontAwesome backgroundColor={"#FBFCFD"} color={"#2A334A"} name="th" size={24} onPress={() => navigation.navigate("MyFiltersScreen")}></FontAwesome>
                                      ),*/
              }}
            />

    </Stack.Navigator>


  );
}

import React from 'react';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Linking } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { NewOrders } from "@screens/orders/NewOrders";
import { OrdersScreen } from "@screens/orders/Orders";

import { localize } from '@translations/localize';

/**
 * This function creates a tab navigator that has a home tab, work order tab, inbox tab, and document
 * archive tab
 * @returns A tab navigator component.
 */
export function TabNavigator() {

    const Tab = createBottomTabNavigator();

    const activeColor = "#233877";
    const inactiveColor = "#ACB7D9";

    return (
    
                <Tab.Navigator  >

                            <Tab.Screen

                                name="NewOrders"
                                component={NewOrders}
                            
                                options={({ navigation }) => ({
                                    tabBarActiveTintColor: activeColor,
                                    title: localize('main.screens.newOrder.tab'),
                                    tabBarInactiveTintColor: inactiveColor,
                                    tabBarIcon: ({ size, color }) => (
                                        <FontAwesome5 name="plus" size={size} color={color} />
                                    ),
                                    headerShown: false,

                                })}

                            />

                                <Tab.Screen

                                name="OrdersTab"
                                component={OrdersScreen}
                            
                                options={({ navigation }) => ({
                                    tabBarActiveTintColor: activeColor,
                                    title: localize('main.screens.orders.tab'),
                                    tabBarInactiveTintColor: inactiveColor,
                                    tabBarIcon: ({ size, color }) => (
                                        <FontAwesome5 name="bars" size={size} color={color} />
                                    ),
                                    headerShown: false,

                                })}

                            />
            
                </Tab.Navigator>

    )

}
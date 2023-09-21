import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, Alert } from "react-native";
import { DrawerContentScrollView, DrawerItem, } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { localize, initLanguage } from '../translations/localize';
import { Ionicons } from "@expo/vector-icons";

import { useDrawerStatus } from '@react-navigation/drawer';
import { MenuItems } from '@components/MenuItems';
import { doUserLogOut } from "@components/login/UserLogOut";

  
export function DrawerContent(props){

    const navigation = useNavigation();
    const isDrawerOpen = useDrawerStatus() === 'open';



 
      return (
        <View style={styles.container}>

            <View style={styles.header}>
    

            </View>
            <DrawerContentScrollView {...props}>
            
              <MenuItems />

                <View style={styles.space}></View>



            </DrawerContentScrollView>

            <View style={styles.footer}>
                <DrawerItem
                    label={localize('main.navigation.menu.settings')}
                    onPress={() => {
                        navigation.navigate('SettingsNavigator');
                    }}
                    icon={({ focused, color, size }) => <Ionicons name="cog-outline" size={size} color={color} />}
                />
                <DrawerItem
                    label={localize('main.navigation.menu.help')}
                    onPress={() => {
                        navigation.navigate('HelpNavigator');
                    }}
                    icon={({ focused, color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />}
                />


                <DrawerItem
                    label={localize('main.navigation.menu.logout')}
                    style={styles.footerItem}
                    onPress={doUserLogOut}
                    icon={({ focused, color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
                />
            </View>


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
    footer: {
        backgroundColor: "#F7F8FB",
        paddingLeft: 20,
        height: 180,

    },
    container: {
        flex: 1,

    },
    mainMenu: {
        paddingLeft: 20,
        marginTop: -20

    },
    logo: {
        width: 70,
        height: 70,
        marginLeft: 25,
        marginTop: 30,
        resizeMode: 'contain',
    },

});
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { localize } from "@translations/localize";

import LottieView from 'lottie-react-native';

import getActivityName from '@components/dogs/training/getActivityName';
import { formatDateWithTime } from '@components/helpers/DateUtils';  

const GuideModal = ({ selectedItem, closeModal, }) => {

  let animationSource;

  switch (selectedItem.animation) {
    case 'newHome':
      animationSource = require('@animations/dogs/newHome.json');
      break;
    case 'calling':
      animationSource = require('@animations/dogs/calling.json');
      break;
    case 'fetch':
      animationSource = require('@animations/dogs/fetch.json');
        break;
    case 'feeding':
      animationSource = require('@animations/dogs/feeding.json');
        break;
     case 'social':
      animationSource = require('@animations/dogs/social.json');
        break;
    case 'outside':
      animationSource = require('@animations/dogs/outside.json');
        break;
   case 'clean':
      animationSource = require('@animations/dogs/clean.json');
        break;
    case 'reward':
      animationSource = require('@animations/dogs/reward.json');
        break;
    case 'alone':
        animationSource = require('@animations/dogs/alone.json');
          break;
    case 'disturb':
        animationSource = require('@animations/dogs/disturb.json');
              break;
    case 'grooming':
                animationSource = require('@animations/dogs/grooming.json');
                      break;
    // ... andre tilfeller
    default:
      animationSource = null;
  }
  

  return (<>
    <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>
            {selectedItem.title}
            </Text>

                {selectedItem.animation && (
                  <View style={{alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 6, padding: 5}}>
                        <LottieView style={styles.animation}  source={animationSource} autoPlay loop={true}   /></View>)}


            <Text style={styles.fieldTitle}>
            {localize('main.screens.dogDetail.training.description')}
            </Text>

            <View style={styles.fieldBox}>
            <Text style={styles.tableRowContent}>
            {selectedItem.description}
            </Text>
            </View>

            {selectedItem.exercise &&(<>           
                    <Text style={styles.fieldTitle}>
                    {localize('main.screens.dogDetail.training.exercise')}
                    </Text>                 
                    <View style={styles.fieldBox}>
                          <Text style={styles.tableRowContent}>
                          {selectedItem.exercise}
                          </Text>  
                     </View></>)}


            {selectedItem.tips &&(<>           
                    <Text style={styles.fieldTitle}>
                    {localize('main.screens.dogDetail.training.tips')}
                    </Text>                 
                    <View style={styles.fieldBox}>
                          <Text style={styles.tableRowContent}>
                          {selectedItem.tips}
                          </Text>  
                     </View></>)}
          


      </View>


 
 </> );
};

const styles = StyleSheet.create({
  animation:{
    width: 200,
    height: 180,
  },
    tableSection: {
        marginBottom: 20,
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 0,
      },
      tableSectionTitle: {
        alignItems: 'center',
        marginBottom: 10,
        fontSize: 18,
        fontWeight: '600',
      },
      tableSectionSmallTitle: {
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '400',
      },
      tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      tableRowLabel: {
        fontSize: 16,
        color: '#8E8E93',
      },
      tableRowContent: {
        fontSize: 14,
      },
      fieldTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
      },
      fieldBox: {
        backgroundColor: '#f2f2f2',  // Feel free to change the color
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
      },
    closeButton: {
        width: 100,
        backgroundColor: "#007AFF",
        borderRadius: 12,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "600",
        textAlign: "center",
    },

});

export default GuideModal;


import React, { useState, useEffect } from 'react';
import { Alert, View, SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";
import { FontAwesome5 } from '@expo/vector-icons';

export const DogHealthScreen = ({ route, navigation }) => {

  const goToWeight = () => {
   navigation.navigate('DogWeightScreen', {id: route.params.id});
  };


   const goToTraining = () => {
    navigation.navigate('DogTrainingScreen', {id: route.params.id});
   };

   const goToMedicine= () => {
    navigation.navigate('DogMedicineScreen', {id: route.params.id});
   };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
         <View style={styles.container}>

            <View style={styles.buttonCardContainer}>
                  
                  {/* History Button */}
                  <TouchableOpacity 
                    style={[styles.card, styles.buttonCard, { marginRight: 10 }]} 
                    onPress={goToWeight}
                  >
                    <FontAwesome5 name="weight" size={24} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{localize("main.screens.dogDetail.medicine.weight.title")}</Text>
                  </TouchableOpacity>
            
              {/* History Button */}
              <TouchableOpacity 
                    style={[styles.card, styles.buttonCard]} 
                    onPress={goToTraining}
                  >
                    <FontAwesome5 name="paw" size={24} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{localize("main.screens.dogDetail.showTraining")}</Text>
                  </TouchableOpacity>
            
              
            </View>

            <View style={styles.buttonCardContainer}>
                
                      <TouchableOpacity 
                        style={[styles.card, styles.buttonCard]} 
                        onPress={goToMedicine}
                      >
                        <FontAwesome5 name="plus" size={24} style={[styles.buttonIcon, { color: '#FF0000' }]} />
                        <Text style={styles.buttonText}>{localize("main.screens.dogDetail.medicine.medicineLog.title")}</Text>
                      </TouchableOpacity>
            </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );



};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: '#333',  // Dark gray
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,  // Add a bottom border for each row
    borderColor: '#E0E0E0',  // Border color
    paddingTop: 12,
    paddingBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',  // Slightly bold for the label
    color: '#333',
  },
  buttonCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  buttonCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',  // Changed to 'flex-start' for left alignment
    padding: 20,
  },
  buttonIcon: {
    marginRight: 15,
    color: '#007AFF',  // Apple's default blue
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    flexShrink: 1,  // Allow the text to shrink if needed
  },
});

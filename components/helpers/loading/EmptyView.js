import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const EmptyView = ({ text, isLoading }) => {
  return (<>
    {!isLoading ? (<View style={styles.container}>
      <LottieView
        source={require('@assets/animations/emptyDog.json')} // Oppdater denne stien til din Lottie-animasjonsfil
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>{text ? text : 'Her var det tomt'}</Text>
    </View>) : (
      <View style={styles.container}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.text}>Laster...</Text>
      </View>
    </View>
    )}
 </>);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height/2,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  overlay: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },

});

export default EmptyView;

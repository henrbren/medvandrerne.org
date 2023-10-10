import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const EmptyView = ({ text, isLoading, title }) => {
  return (<>
    {!isLoading ? (<View style={styles.container}>
    
      {/*<LottieView
        source={require('@assets/animations/dogs/alone.json')} // Oppdater denne stien til din Lottie-animasjonsfil
        autoPlay
        loop
        style={styles.lottie}
    />*/}

        <View style={styles.card}>
              
             <Text style={styles.title}>{title ? title : 'Her var det tomt'}</Text>
              <Text style={styles.text}>{text ? text : 'Her var det tomt'}</Text>
        </View>
  
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
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    textAlign: 'left',
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'left',

  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    width: 300
  },
  overlay: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  
  },

});

export default EmptyView;

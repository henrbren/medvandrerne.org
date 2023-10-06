import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

import LottieView from 'lottie-react-native';


const SystemModal = ({ isVisible, closeModal, children, backdrop, backdropToValue, celebration, onShare }) => {
  const [backdropOpacity, setBackdropOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      Animated.timing(backdropOpacity, {
        toValue: backdropToValue ? backdropToValue : 0.5,
        duration: 3000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={closeModal}
  >
    <View style={styles.centeredView}>
      <Animated.View style={{ ...styles.backdrop, opacity: backdrop ? backdropOpacity : 0.01 }} />
      {celebration && <LottieView style={styles.backdropConfetti}  source={require('@animations/confetti.json')} autoPlay loop={false}   />}
      {celebration && <LottieView style={styles.backdropFirework}  source={require('@animations/firework.json')} autoPlay loop={true}   />}
  
      <View style={styles.modalView}>
        
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Ionicons name="close" size={30} color="black" />
        </TouchableOpacity>
        
        {onShare && <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                    <Ionicons name="share-outline" size={30} color="black" />
        </TouchableOpacity>}
        {children}
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1
  },   
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#272d41',
  },
  backdropConfetti:{
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  backdropFirework:{
    backgroundColor: 'transparent',
    position: 'absolute',
    top: -30,
    left: -100,
    width: 1200,
  },
  modalView: {
    overflow: 'hidden',
    margin: 20,
    marginTop: 120,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 99,

    
  },
  shareButton:{
    position: 'absolute',
    top: 15,
    left: 15,
  }
});

export default SystemModal;

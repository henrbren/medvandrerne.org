import React from 'react';
import { Modal, View, ActivityIndicator, Text } from 'react-native';
import { localize } from "@translations/localize";

const LoadingModal = ({ isVisible, onRequestClose, text, backgroundColor }) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: backgroundColor ? backgroundColor : "rgba(0,0,0,0.5)" }}>
        <View style={{  backgroundColor:  'rgba(0,0,0,0.7)',
        borderRadius: 8,
        padding: 35,
        alignItems: 'center',}}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color:'#fff', marginTop: 5}}>{text ? text : localize('main.meta.loading')}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;

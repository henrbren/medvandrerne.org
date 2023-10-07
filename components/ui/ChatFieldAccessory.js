import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet,InputAccessoryView } from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { localize } from "@translations/localize";

const ChatFieldAccessory = ({ value, setUserMessage, handleSendMessage }) => {

  const handleSearch = (text) => {
    setUserMessage(text);
  };

  const inputAccessoryViewID = 'dogChat';

  return (<>
           <View style={[styles.inputContainer, {paddingBottom: 40}]}>
                <TextInput
                  value={value}
                  onChangeText={setUserMessage}
                  style={styles.input}
                  placeholder="Skriv en melding"
                  inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
                  placeholderTextColor="#777"
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                  <Text style={{ color: '#FFF' }}>Send</Text>
                </TouchableOpacity>
      </View>
     
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
                <View style={styles.inputContainer}>
                    <TextInput
                      value={value}
                      onChangeText={setUserMessage}
                      style={styles.input}
                      placeholder="Skriv en melding"
                      placeholderTextColor="#777"
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                      <Text style={{ color: '#FFF' }}>Send</Text>
                    </TouchableOpacity>
                  </View>
        </InputAccessoryView>
      )}
</>);
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderTopWidth: 1,

    borderTopColor: '#E0E0E0', // Apple's gray color
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#E0E0E0', // Apple's gray color
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF', // Apple's blue color
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: 8,
  },
});

export default ChatFieldAccessory;

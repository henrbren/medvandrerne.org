import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  RefreshControl,
  TextInput
} from 'react-native';
import Parse from 'parse/react-native';

import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import ChatFieldAccessory from '@ui/ChatFieldAccessory';

import { useNavigation } from '@react-navigation/native';
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent
import * as Haptics from 'expo-haptics';


export const DogChatScreen = () => {

  const navigator = useNavigation();
  const [readResults, setReadResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const flatListRef = useRef();  // Legger til denne referansen

  const scrollToBottom = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    readMeasures();
    console.log('DogsScreen useEffect')
  }, []);

  const readMeasures = async () => {
    setRefreshing(true);
    const parseQuery = new Parse.Query('dogs');
    parseQuery.equalTo('owner', Parse.User.current());

    try {
      const todos = await parseQuery.find();
      setReadResults(todos);
      setRefreshing(false);
    } catch (error) {
      Alert.alert('Error!', error.message);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setMessages([]); // Clear all messages
    setRefreshing(false);
  }, []);

  const realApiRequest = async (requestData) => {
    const url = 'https://ai.laft.io/chat'; // Erstatt med din faktiske API-URL
    const token = 'lft_ai_345678_exampleClient'; // Erstatt med din faktiske API-token
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (response.ok) {
        const data = await response.json();
        return data; // Dataen du får tilbake fra API-kallet
      } else {
        throw new Error(`API responded with status ${response.status}`);
      }
    } catch (error) {
      console.error(`API request failed: ${error}`);
      return null;
    }
  };
  
  
  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setUserMessage('');
    setIsLoadingResponse(true);
    setMessages([...messages, { role: 'user', content: userMessage }]);
    
    // Send request to your AI service
    const requestData = {
      temperature: 0.1,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `Du er "Dyrehvisker AI". En assistent og en dyrehvisker som befinner seg i appen Dyremappa, som skal hjelpe brukeren med konkrete råd og tips for sine dyr. \n
          Du er vennlig, og svarer med konkret informasjon som vil hjelpe eieren.\n
          
          Du skal ikke returnere lenker. \n
          Du skal ikke returnere bilder. \n
          Du skal ikke returnere videoer. \n
          Svar gjerne med emojis hvis det er passende. \n
          Spør brukeren om du skal gjøre noe mer, eller kom med tips relevante for rasen og alderen til dyrene. \n
          For å hjepe brukeren har du tilgang til data om dyrene til brukeren: \n
          Data i JSON: ${JSON.stringify(readResults)} \n`,
        },
        { role: 'user', content: userMessage },
      ],
    };

    // Replace this with actual fetch request to your API
    const apiResponse = await realApiRequest(requestData).then((data) => {
      setMessages([...messages, { role: 'user', content: userMessage }, { role: 'bot', content: data }]);
      setIsLoadingResponse(false);
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )
    }).catch((error) => {
      console.log(error);
      setMessages([...messages, { role: 'user', content: userMessage }, { role: 'bot', content: 'Kunne ikke svare. Prøv igjen..' }]);
      setIsLoadingResponse(false);
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
    });
    
  
  };


  const botIsWriting = ({ item }) => ( <View style={styles.botMessage}>
    <Text style={styles.botText}>
      <LottieView style={{width: 40}}  source={require('@animations/writing.json')} autoPlay loop={true} />
      </Text>
  </View>);

  const renderItem = ({ item }) => (
    <View style={item.role === 'user' ? styles.userMessage : styles.botMessage}>
      <Text style={item.role === 'user' ? styles.userText : styles.botText}>{item.content}</Text>
    </View>
  );

 return (
  <View style={styles.container}>
      <FlatList
        data={messages}
        ref={flatListRef} 
        renderItem={renderItem}
        onContentSizeChange={scrollToBottom} 
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={isLoadingResponse ? botIsWriting : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
              <ChatFieldAccessory value={userMessage} setUserMessage={setUserMessage} handleSendMessage={handleSendMessage} />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF', // Apple's blue color
    padding: 10,
    borderRadius: 16,
    margin: 10,
  },
  userText:{
    color: '#FFF'
  },
  botText:{},
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0', // Apple's gray color
    padding: 10,
    borderRadius: 16,
    margin: 10,
  
  },

});
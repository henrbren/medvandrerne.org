import React, { useState, useEffect,  } from 'react';
import Parse from 'parse/react-native';
import { TouchableOpacity, FlatList, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Haptics from 'expo-haptics';

const BadgeList = ({id}) => {

    const [readResults, setReadResults] = useState([]);
    const dogId = id;

    useEffect(() => {
        readAnimalData();
      }, []);
    
    const readAnimalData = async function () {
        // Reading parse objects is done by using Parse.Query
        const parseQuery = new Parse.Query('dogRewards');
        const dogPointer = Parse.Object.extend('dogs').createWithoutData(dogId);
        parseQuery.equalTo('dogOwner', dogPointer);
        parseQuery.descending('date');
        parseQuery.limit(6);

        try {
          let dogs = await parseQuery.find();

          const badges = dogs.map(dog => ({
            badge: dog.get('badge'),
          }));

            setReadResults(badges)

            return true;
          
        } catch (error) {
          Alert.alert('Error!', error.message);
          return false;
        }
      };


    
  const renderItem = ({ item }) => {
    const badge = item.badge
    if (!badge) return null;

    console.log(badge)

    return (<View style={{backgroundColor: '#f2f2f2', marginRight: 5, borderRadius: 12}}>
                    <FontAwesome5 
                            name={badge} 
                            size={16} 
                            color="orange" 
                            style={{ margin: 4 }}
                        />
                    </View>
    
    );
  };



  return (
    <TouchableOpacity 
        onPress={() => {  
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            readAnimalData()}} 
        style={{ flexDirection: 'row',  height: 25, width: '100%', marginTop: 5 }}>
      <FlatList
        data={readResults}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </TouchableOpacity>
  );
  
};

export default BadgeList;

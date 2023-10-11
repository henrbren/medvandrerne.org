import React, { useState, useEffect, useRef, useMemo } from 'react';
import {Alert, StyleSheet, SafeAreaView, View, ScrollView, Text} from 'react-native';
import { formatDateWithTime, formatDate } from '@components/helpers/DateUtils';  // adjust the import path as needed
import { Dimensions } from 'react-native';

import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import { localize } from "@translations/localize";

import { DogWeightForm } from '@components/dogs/DogWeightForm'; 

import HeaderRightButton from '@components/dogs/training/HeaderRightButton';
import WeightList from '@components/dogs/medicine/weight/WeightList';
//import { LineChart, YAxis, Grid } from 'react-native-svg-charts';


import ReusableBottomSheet from '@ui/ReusableBottomSheet';  // Importer ReusableBottomSheet
import SearchFieldAccessory from '@ui/SearchFieldAccessory';
import { deleteItem } from '@parse/deleteItem';

export const DogWeightScreen = ({ route, navigation }) => {

  navigator = useNavigation();

  const screenWidth = Dimensions.get('window').width;

 const bottomSheetRef = useRef(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [refreshing, setRefreshing] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
  const [readResults, setReadResults] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      title: localize('main.screens.dogDetail.medicine.weight.title'),
      headerRight: () => <HeaderRightButton onPress={showBottomSheet} />
    });
  }, [navigation]);
    
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    readDogData().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    readDogData();
  }, []);


  const readDogData = async function () {

    const parseQuery = new Parse.Query('dogWeight');
    const dogPointer = Parse.Object.extend('dogs').createWithoutData(route.params?.id);
    parseQuery.equalTo('dogOwner', dogPointer);
    parseQuery.descending('date');
  

    try {
      let dogs = await parseQuery.find();

      setReadResults(dogs);
      setIsLoading(false)
      return true;
    } catch (error) {
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  const graphData = useMemo(() => {
    const labels = readResults.map(item => formatDate(item.get('date'))).filter(Boolean).reverse();
    const data = readResults.map(item => item.get('weight') / 1000).filter(Number.isFinite).reverse();
  
    if (labels.length === 0 || data.length === 0) {
      return null; // Returnerer null hvis det ikke er data å vise
    }
  
    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  }, [readResults]);
  
  

  const showBottomSheet = () => {
    bottomSheetRef.current.open();
  };

  const closeSheet = () => {
    bottomSheetRef.current.close();
    readDogData()
  };

  const onSelectItem = (data) => {

    const weightInKg = data.get('weight') / 1000; // Antar at vekten er i gram og konverterer til kg
    Alert.alert(`${weightInKg} kg`, `${formatDateWithTime(data.get('date'))}`);
  };

  const onDeleteItem = (objectId) => {
    deleteItem(objectId, 'dogWeight', readDogData, closeModal);
  };

  const closeModal = () => {
  
  };


  const convertDate = (dateStr) => {
    const [day, month, year] = dateStr.split(".");
    return new Date(`${year}-${month}-${day}`);
  };
  
  const calculateTimeFrame = (dates) => {
    if (dates.length < 2) return "Ikke nok data";
  
    const sortedDates = [...dates].sort((a, b) => convertDate(a) - convertDate(b));
    const firstDate = convertDate(sortedDates[0]);
    const lastDate = convertDate(sortedDates[sortedDates.length - 1]);
    
    const diffTime = Math.abs(lastDate - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} ${localize('main.dates.days')}`;
  };

  const filteredResults = useMemo(() => {
    return readResults.filter(item => {

      const date = formatDateWithTime(item.get('date')).toLowerCase();
      const weight = item.get('weight').toString().toLowerCase();
      const query = searchQuery.toLowerCase();
  
      return weight.includes(query) || date.includes(query)
    });
  }, [readResults, searchQuery]);
  
  const data = graphData?.datasets[0].data;
  const dates = readResults.map(item => formatDate(item.get('date'))).filter(Boolean);
  const timeFrame = calculateTimeFrame(dates);


  return (<>
    <SafeAreaView style={styles.container}>
             
         {data && ( <View style={{ height: 260, padding: 20, backgroundColor: 'white' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
              {/*<LineChart
                  style={{ flex: 1, marginLeft: 10 }}
                  data={data}
                  svg={{ stroke: 'rgb(0, 122, 255)', strokeWidth: 2 }}
                  contentInset={{ top: 20, bottom: 20 }}
  >
                  <Grid svg={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeWidth: 1 }} />
              </LineChart>
              <YAxis
                  data={data}
                  style={{ marginLeft: 10 }}
                  contentInset={{ top: 20, bottom: 20 }}
                  svg={{ fontSize: 10, fill: 'grey' }}
              />
              */}
          </View>
          <Text style={{ fontSize: 12, color: 'grey', marginBottom: 10 }}>
        Tidsramme: {timeFrame}
    </Text>
      </View>)}


        <WeightList 
            data={filteredResults} 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            onSelectItem={onSelectItem}
            onDeleteItem={onDeleteItem}  // Legg til denne linjen
            isLoading={isLoading}
          />

        <SearchFieldAccessory searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

    </SafeAreaView>

      <ReusableBottomSheet
            sheetRef={bottomSheetRef}
            height={600}
            dragFromTopOnly={true}
            colors={{background: '#F9F9F9'}}
        >
          <DogWeightForm dog={route.params?.id} close={closeSheet} />
      </ReusableBottomSheet>

 </> );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
});


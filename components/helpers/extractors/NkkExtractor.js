import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const NkkExtractor = ({ url, onDataExtracted }) => {
  const [isWebViewVisible, setIsWebViewVisible] = useState(true);

  const injectedJavaScript = `
  function parseTable() {
    let dogInfo = {};
    let breederInfo = {};
    let parentInfo = {};
    
    let dogTable = document.querySelector('fieldset > table.sText');
    let breederTable = document.querySelectorAll('fieldset')[1].querySelector('table.sText');
    let parentTables = document.querySelectorAll('td[rowspan="3"]');
    
    function parseRows(rows, infoObj) {
      rows.forEach((row) => {
        let cells = row.querySelectorAll('td');
        if(cells.length > 1) {
          let key = cells[0].textContent.trim().replace(/\\s+/g, ' ');
          let value = cells[1].textContent.trim().replace(/\\s+/g, ' ');
          if(key && value){
            infoObj[key] = value;
          }
        
        }
      });
    }
    
    parseRows(dogTable.querySelectorAll('tr'), dogInfo);
    parseRows(breederTable.querySelectorAll('tr'), breederInfo);
    
    parentInfo['Father'] = parentTables[0].textContent.trim().replace(/\\s+/g, ' ');
    parentInfo['Mother'] = parentTables[1].textContent.trim().replace(/\\s+/g, ' ');
    
    let result = {
      dogInfo,
      breederInfo,
      parentInfo
    };
    
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  }
  parseTable();
`;


  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onDataExtracted(data); // Pass extracted data to parent component
      setIsWebViewVisible(false); // Hide WebView after extracting data
    } catch (error) {
      console.error('Error parsing received data:', error);
    }
  };

  return (
    isWebViewVisible && <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
      <WebView 
        source={{ uri: url }} 
        injectedJavaScript={injectedJavaScript} 
        onMessage={onMessage} 
      />
    </View>
  );
};

export default NkkExtractor;

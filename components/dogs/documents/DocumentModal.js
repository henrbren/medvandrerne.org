import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { localize } from "@translations/localize";

import getActivityName from '@components/dogs/training/getActivityName';
import { formatDateWithTime } from '@components/helpers/DateUtils';  

const DocumentModal = ({ selectedItem, closeModal }) => {

  const convertBytesToString = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    if (bytes === 0) return '0 Byte';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };
  return (<>
    <View style={styles.tableSection}>
 

            <Text style={styles.tableSectionSmallTitle}>
            {localize('main.screens.dogDetail.documents.info')}
            </Text>

            <Text style={styles.fieldTitle}>
            {localize('main.screens.dogDetail.documents.fileName')}
            </Text>
            <View style={styles.fieldBox}>
            <Text style={styles.tableRowContent}>
                {selectedItem.get('title')}
            </Text>
            </View>

            <Text style={styles.fieldTitle}>
            {localize('main.screens.dogDetail.documents.fileDesc')}
            </Text>
            <View style={styles.fieldBox}>
            <Text style={styles.tableRowContent}>
                {selectedItem.get('desc') ? selectedItem.get('desc') : localize('main.screens.dogDetail.training.noDescription')}
            </Text>
            </View>

            <Text style={styles.fieldTitle}>
                {localize('main.screens.dogDetail.documents.fileSize')}
                 </Text>
            <View style={styles.fieldBox}>
                <Text style={styles.tableRowContent}>
                        {convertBytesToString(selectedItem.get('size'))}
                </Text>
            </View>

                <Text style={styles.fieldTitle}>
                {localize('main.screens.dogDetail.documents.uploaded')}
                 </Text>
            <View style={styles.fieldBox}>
                <Text style={styles.tableRowContent}>
                    {formatDateWithTime(selectedItem.get('createdAt'))}
                </Text>
            </View>
  </View>

 
 </> );
};

const styles = StyleSheet.create({
    tableSection: {
         marginTop: 20,
        marginBottom: 20,
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 15,
      },
      tableSectionTitle: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: '600',
      },
      tableSectionSmallTitle: {
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '400',
      },
      tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      tableRowLabel: {
        fontSize: 16,
        color: '#8E8E93',
      },
      tableRowContent: {
        fontSize: 16,
      },
      fieldTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
      },
      fieldBox: {
        backgroundColor: '#f2f2f2',  // Feel free to change the color
        borderRadius: 5,
        padding: 10,
      },
    closeButton: {
        width: 100,
        backgroundColor: "#007AFF",
        borderRadius: 12,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "600",
        textAlign: "center",
    },

});

export default DocumentModal;

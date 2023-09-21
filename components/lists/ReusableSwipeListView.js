import React from 'react';
import { SwipeListView } from 'react-native-swipe-list-view';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ReusableSwipeListView = ({
  data,
  renderItem,
  deleteItem,
  onRefresh,
  refreshing,
  keyExtractor,
}) => {
  return (
    <SwipeListView
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshing={refreshing}
      onRefresh={onRefresh}
      leftOpenValue={75}
    />
  );
};

export default ReusableSwipeListView;

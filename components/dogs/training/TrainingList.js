import React from 'react';
import { FlatList, View, Text } from 'react-native';
import TrainingListItem from './TrainingListItem';  // Importer din TrainingListItem komponent
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent

const TrainingList = ({ data, refreshing, onRefresh, onSelectItem, onDeleteItem }) => {
  const renderItem = ({ item }) => {
    return (<TrainingListItem 
        item={item} 
        onSelect={() => onSelectItem(item)} 
        onDelete={() => onDeleteItem(item.id)}
      />)
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      ListEmptyComponent={() => <EmptyView text="Ingen treninger tilgjengelige" />}  // Bruk din egen lokaliseringsfunksjon her
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default TrainingList;

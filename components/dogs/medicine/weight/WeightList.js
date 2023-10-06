import React from 'react';
import { FlatList, View, Text } from 'react-native';
import WeightListItem from './WeightListItem';  // Importer din TrainingListItem komponent
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent

const WeightList = ({ data, refreshing, onRefresh, onSelectItem, onDeleteItem, isLoading }) => {

  const renderItem = ({ item }) => {
    return (<WeightListItem 
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
      ListEmptyComponent={() => <EmptyView text="Ingenting loggført" isLoading={isLoading}  />}  // Bruk din egen lokaliseringsfunksjon her
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default WeightList;

import React from 'react';
import { FlatList, View, Text } from 'react-native';
import DocumentListItem from './DocumentListItem';  // Importer din TrainingListItem komponent
import EmptyView from '@components/helpers/loading/EmptyView';  // Importer din EmptyView komponent
import { localize } from "@translations/localize";


const DocumentList = ({ data, refreshing, onRefresh, onSelectItem, onDeleteItem, isLoading }) => {

  const renderItem = ({ item }) => {
    return (<DocumentListItem 
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
      ListEmptyComponent={() => <EmptyView title={localize('main.screens.dogDetail.documents.noLogs')}  text={localize('main.screens.dogDetail.documents.noLogsHelp')} isLoading={isLoading}  />}  // Bruk din egen lokaliseringsfunksjon her
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default DocumentList;

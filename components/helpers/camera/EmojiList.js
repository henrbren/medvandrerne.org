import { useState } from 'react';
import { StyleSheet, FlatList, Image, Platform, Pressable } from 'react-native';

export default function EmojiList({ onSelect, onCloseModal }) {
  const [emoji] = useState([
    require('@stickers/circle.png'),
    require('@stickers/square.png'),
    require('@stickers/delete.png'),
    require('@stickers/remove.png'),
    require('@stickers/check.png'),
    require('@stickers/danger.png'),
    require('@stickers/time.png'),
    require('@stickers/question.png'),
    require('@stickers/arrow-right.png'),
    require('@stickers/checkmark.png'),
    require('@stickers/signed.png'),
    require('@stickers/done.png'),
    
  ]);

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      data={emoji}
      numColumns={3}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => {
        return (
          <Pressable
            onPress={() => {
              onSelect(item);
              onCloseModal();
            }}>
            <Image source={item} key={index} style={styles.image} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 70,
    height: 70,
    margin: 20,
  },
});
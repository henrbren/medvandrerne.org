import { useState } from 'react';
import { StyleSheet, FlatList, Image, Platform, Pressable } from 'react-native';

export default function EmojiList({ onSelect, onCloseModal }) {
  const [emoji] = useState([
    require('@stickers/moustache.png'),
    require('@stickers/mustache.png'),
    require('@stickers/mustache_stick.png'),
    require('@stickers/sun-glasses.png'),
    require('@stickers/eyeglasses.png'),
    require('@stickers/potter-glasses.png'),
    require('@stickers/dog-treat.png'),
    require('@stickers/treat.png'),
    require('@stickers/snack.png'),
    require('@stickers/meat.png'),


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
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useState } from 'react';
import HorizontalScrollView from '@/components/HorizontalScrollView';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';

const CategorySelector = ({ containerStyle }: { containerStyle: ViewStyle }) => {

  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selected, setSelected] = useState(0);

  const { theme } = useGlobalContext();

  return (
    <View 
      style={[Local.container, containerStyle]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      <HorizontalScrollView
        contentWidth={contentWidth}
        containerWidth={containerWidth}
      >
        <View
          style={Local.contentContainer}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContentWidth(width);
          }}
        >
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 0 ? theme : Colors.song }]}
            onPress={() => setSelected(0)}
            activeOpacity={0.8}
          >
            <Text style={Local.item}>Playlists</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 1 ? theme : Colors.song }]}
            onPress={() => setSelected(1)}
            activeOpacity={0.8}
          >
            <Text style={Local.item}>Albums</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 2 ? theme : Colors.song }]}
            onPress={() => setSelected(2)}
            activeOpacity={0.8}
          >
            <Text style={Local.item}>Artists</Text>
          </TouchableOpacity>
        </View>
      </HorizontalScrollView>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    // marginVertical: 10,
    // backgroundColor: 'blue',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    gap: 5,
  },
  itemContainer: {
    backgroundColor: Colors.song,
    borderRadius: 20,
  },
  item: {
    ...Styles.h6,
    color: Colors.text,
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
});

export default CategorySelector;
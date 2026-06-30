import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useState } from 'react';
import HorizontalScrollView from '@/src/components/HorizontalScrollView';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import { useThemeContext } from '@/src/context/ThemeProvider';
import { darkenColor } from '@/src/controllers/ColorController';

type CategorySelectorProps = {
  containerStyle: ViewStyle;
  selected: number;
  callback: (selected: number) => void;
}


const CategorySelector = ({ containerStyle, selected, callback }: CategorySelectorProps) => {

  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const { theme } = useThemeContext();

  const inline = StyleSheet.create({
    darkText: {
      color: darkenColor(theme, 50, 30),
    },
    lightText: {
      color: Colors.text,
    }
  });

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
            onPress={() => {
              callback(0);
            }}
            activeOpacity={0.8}
          >
            <Text style={[Local.item, selected === 0 ? inline.darkText : inline.lightText]}>Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 1 ? theme : Colors.song }]}
            onPress={() => {
              callback(1);
            }}
            activeOpacity={0.8}
          >
            <Text style={[Local.item, selected === 1 ? inline.darkText : inline.lightText]}>Playlists</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 2 ? theme : Colors.song }]}
            onPress={() => {
              callback(2);
            }}
            activeOpacity={0.8}
          >
            <Text style={[Local.item, selected === 2 ? inline.darkText : inline.lightText]}>Albums</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[Local.itemContainer, { backgroundColor: selected === 3 ? theme : Colors.song }]}
            onPress={() => {
              callback(3);
            }}
            activeOpacity={0.8}
          >
            <Text style={[Local.item, selected === 3 ? inline.darkText : inline.lightText]}>Artists</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
});

export default CategorySelector;

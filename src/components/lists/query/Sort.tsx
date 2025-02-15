import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRef } from "react";

import { MenuView, MenuComponentRef } from '@react-native-menu/menu'

import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import { SortType } from "@/src/constants/Types";

type SortProps = {
  setSort: (sort: SortType) => void;
  sort: SortType;
}

export default function Sort({ setSort, sort }: SortProps) {

  const menuRef = useRef<MenuComponentRef>(null);
  
  return (
    <>
      <TouchableOpacity 
        style={Local.container} 
        activeOpacity={0.8}
        onPress={() => {
          menuRef.current?.show();
        }}
      >
        <Text style={Local.text}>Sort</Text>
      </TouchableOpacity>
      <MenuView ref={menuRef} actions={[
        {
          title: 'Alphabetical',
        },
        {
          title: 'Newest',
        },
        {
          title: 'Oldest',
        },

      ]} />
    </>
  );

} 

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    backgroundColor: Colors.song,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 15,
    height: 15,
    tintColor: Colors.text,
  },
  text: {
    ...Styles.h6,
    color: Colors.text,
  },
});

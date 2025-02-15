import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";

export default function Sort() {
  return (
    <TouchableOpacity style={Local.container} activeOpacity={0.8}>
      <Text style={Local.text}>Sort</Text>
    </TouchableOpacity>
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

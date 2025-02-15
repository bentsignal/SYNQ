import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Styles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";

export default function Sort() {
  return (
    <TouchableOpacity style={Local.container} activeOpacity={0.8}>
      <Image source={require('@/src/assets/icons/sort.png')} style={Local.image} />
    </TouchableOpacity>
  );
} 

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    backgroundColor: Colors.song,
    padding: 10,
  },
  image: {
    width: 15,
    height: 15,
    tintColor: Colors.text,
  },
});

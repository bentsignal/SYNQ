import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";

const Playlists = () => {
  return (
    <View style={Local.container}>
      <Text style={Local.placeholderText}>Playlists</Text>
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
  },
  placeholderText: {
    ...Styles.h3,
    color: Colors.text,
  }
});

export default Playlists;
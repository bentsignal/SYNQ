import { View, TextInput, Image, StyleSheet } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";

export default function Search() {
  return (
    <View style={Local.container}>
      <Image 
        source={require('@/src/assets/icons/search.png')} 
        style={Local.image} 
      />
      <TextInput
        style={Local.input}
        placeholder="Search"
        onChangeText={() => {}}
        placeholderTextColor={Colors.text}
      />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.song,
    padding: 10,
  },
  image: {
    width: 15,
    height: 15,
    tintColor: Colors.text,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
  },
});

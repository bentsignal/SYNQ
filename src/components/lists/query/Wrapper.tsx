import { View, StyleSheet } from "react-native";
import Search from "./Search";
import Sort from "./Sort";

export default function QueryWrapper() {
  return (
    <View style={Local.container}>
      <Search />
      <Sort />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 5,
  },
});

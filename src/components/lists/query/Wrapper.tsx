import { View, StyleSheet } from "react-native";
import Search from "./Search";
import Sort from "./Sort";

type QueryWrapperProps = {
  setQuery: (text: string) => void;
  query: string;
}

export default function QueryWrapper({ setQuery, query }: QueryWrapperProps) {
  return (
    <View style={Local.container}>
      <Search setQuery={setQuery} query={query} />
      <Sort />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 3,
    gap: 5,
    width: '102%',
    marginLeft: -2.5,
  },
});

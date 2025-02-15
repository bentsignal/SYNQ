import { View, StyleSheet } from "react-native";
import Search from "./Search";
import Sort from "./Sort";

type QueryWrapperProps = {
  setQuery: (text: string) => void;
  query: string;
  songList?: boolean;
}

export default function QueryWrapper({ setQuery, query, songList }: QueryWrapperProps) {
  return (
    <View style={[Local.container, songList ? {
      width: '102%',
      marginLeft: -2.5,
    } : {}]}>
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
  },
});

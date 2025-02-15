import { View, StyleSheet } from "react-native";
import Search from "./Search";
import Sort from "./Sort";

import { SortType } from "@/src/constants/Types";

type QueryWrapperProps = {
  setQuery: (text: string) => void;
  query: string;
  setSort?: (sort: SortType) => void;
  sort?: SortType;
  songList?: boolean;
}

export default function QueryWrapper({ setQuery, query, setSort, sort, songList }: QueryWrapperProps) {
  return (
    <View style={[Local.container, songList ? {
      width: '102%',
      marginLeft: -2.5,
    } : {}]}>
      <Search setQuery={setQuery} query={query} />
      <Sort setSort={setSort} sort={sort}/>
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

import { View, StyleSheet } from "react-native";
import Search from "./Search";
import Sort from "./Sort";

import { SortType, SortOrder, HideSortTypes } from "@/src/constants/Types";

type QueryWrapperProps = {
  setQuery: (text: string) => void;
  query: string;
  setSort?: (sort: SortType) => void;
  sort?: SortType;
  order?: SortOrder;
  setOrder?: (order: SortOrder) => void;
  songList?: boolean;
  hideSortTypes?: HideSortTypes;
}

export default function QueryWrapper({ 
  setQuery, query, 
  setSort, sort, 
  order, setOrder, 
  songList,
  hideSortTypes
}: QueryWrapperProps) {
  return (
    <View style={[Local.container, songList ? {
      width: '102%',
      marginLeft: -2.5,
    } : {}]}>
      <Search setQuery={setQuery} query={query} />
      <Sort 
        setSort={setSort} 
        sort={sort} 
        order={order} 
        setOrder={setOrder}
        hideSortTypes={hideSortTypes}
      />
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

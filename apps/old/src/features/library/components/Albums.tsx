import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import { useState } from "react";
import AlbumList from "@/src/components/lists/album";
import { Styles as MainStyles } from "@/src/constants/Styles";
import QueryWrapper from "@/src/components/lists/query/Wrapper";
import { useLibraryAlbumsQuery } from "@/src/features/library/hooks/use-library-albums-query";

const Albums = () => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const { albums, isEmpty } = useLibraryAlbumsQuery({ query, sort, order });

  return (
    <View style={Local.container}>
      <AlbumList
        albums={albums}
        pageType={PageType.LIBRARY}
        emptyComponent={<Text style={Local.emptyText}>No albums in library</Text>}
        showEmptyComponent={isEmpty}
        headerComponent={
          <QueryWrapper
            setQuery={setQuery}
            query={query}
            setSort={setSort}
            sort={sort}
            order={order}
            setOrder={setOrder}
            showSortTypes={{
              [SortType.ALBUM]: true,
              [SortType.YEAR]: true,
              [SortType.DATE]: true,
            }}
          />
        }
      />
    </View>
  );
};

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  emptyText: {
    ...MainStyles.h5,
    textAlign: "center",
    marginTop: 20,
    color: Colors.text,
  },
});

export default Albums;

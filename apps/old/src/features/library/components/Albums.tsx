import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { PageType, SortOrder, SortType } from "@/src/constants/Types";
import AlbumList from "@/src/features/library/components/lists/album";
import { Styles as MainStyles } from "@/src/constants/Styles";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibraryAlbumsQuery } from "@/src/features/library/hooks/use-library-albums-query";

const Albums = () => {
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.DESC,
      initialSort: SortType.DATE,
    });
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

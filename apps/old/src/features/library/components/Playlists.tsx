import { StyleSheet, View } from "react-native";
import PlaylistList from "@/src/features/library/components/lists/playlist";
import { PageType, SortType, SortOrder } from "@/src/constants/Types";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibraryPlaylistsQuery } from "@/src/features/library/hooks/use-library-playlists-query";

const Playlists = () => {
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.DESC,
      initialSort: SortType.DATE,
    });
  const { playlists } = useLibraryPlaylistsQuery({ query, sort, order });

  return (
    <View style={Local.container}>
      <PlaylistList
        playlists={playlists}
        pageType={PageType.LIBRARY}
        headerComponent={
          <QueryWrapper
            setQuery={setQuery}
            query={query}
            setSort={setSort}
            sort={sort}
            order={order}
            setOrder={setOrder}
            showSortTypes={{
              [SortType.DATE]: true,
              [SortType.TITLE]: true,
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
});

export default Playlists;

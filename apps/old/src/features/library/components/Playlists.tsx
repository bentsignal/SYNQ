import { StyleSheet, View } from "react-native";
import PlaylistList from "@/src/features/library/components/lists/playlist";
import { useState } from "react";
import { PageType, SortType, SortOrder } from "@/src/constants/Types";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import { useLibraryPlaylistsQuery } from "@/src/features/library/hooks/use-library-playlists-query";

const Playlists = () => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
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

import { Colors } from "@/src/constants/Colors";
import { Styles as MainStyles } from "@/src/constants/Styles";
import {
  PageType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useLibraryListQueryState } from "@/src/features/library/hooks/use-library-list-query-state";
import { useLibrarySongsQuery } from "@/src/features/library/hooks/use-library-songs-query";
import { StyleSheet, Text, View } from "react-native";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song/SongList";

export default function Songs() {
  const { order, query, setOrder, setQuery, setSort, sort } =
    useLibraryListQueryState({
      initialOrder: SortOrder.DESC,
      initialSort: SortType.DATE,
    });
  const { songs, isEmpty } = useLibrarySongsQuery({
    query,
    sort,
    order,
  });

  return (
    <View style={Local.container}>
      <SongList
        songs={songs}
        sort={sort}
        order={order}
        query={query}
        headerComponent={
          <QueryWrapper
            setQuery={setQuery}
            query={query}
            setSort={setSort}
            sort={sort}
            order={order}
            setOrder={setOrder}
            showSortTypes={{
              [SortType.TITLE]: true,
              [SortType.ARTIST]: true,
              [SortType.ALBUM]: true,
              [SortType.DATE]: true,
            }}
            songList
          />
        }
        showEmptyComponent={isEmpty}
        pageType={PageType.LIBRARY}
        sourceId={1}
        sourceType={SourceType.PLAYLIST}
        emptyComponent={
          <Text style={Local.emptyText}>No songs in library</Text>
        }
      />
    </View>
  );
}

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

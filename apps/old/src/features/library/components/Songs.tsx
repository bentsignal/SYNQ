import { useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles as MainStyles } from "@/src/constants/Styles";
import {
  PageType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useLibrarySongsQuery } from "@/src/features/library/hooks/use-library-songs-query";
import { StyleSheet, Text, View } from "react-native";
import QueryWrapper from "@/src/features/library/components/lists/query/Wrapper";
import SongList from "@/src/features/library/components/lists/song/SongList";

export default function Songs() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
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

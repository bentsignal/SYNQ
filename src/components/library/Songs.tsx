import { useEffect, useState } from "react";
import { Colors } from "@/src/constants/Colors";
import { Styles as MainStyles } from "@/src/constants/Styles";
import {
  PageType,
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { getPlaylistSongs } from "@/src/controllers/PlaylistController";
import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import songBus from "@/src/events/song/Bus";
import { SongBusEvent } from "@/src/events/song/Events";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { StyleSheet, Text, View } from "react-native";
import QueryWrapper from "../lists/query/Wrapper";
import SongList from "../lists/song/SongList";

export default function Songs() {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [showEmptyComponent, setShowEmptyComponent] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);
  const { data } = useLiveQuery(db.select().from(schema.songsTable), []);
  console.log(
    "data",
    data.map((song) => song.title),
  );

  const refreshSongs = async () => {
    const results = await getPlaylistSongs(
      1,
      PageType.LIBRARY,
      sort,
      order,
      query,
    );
    setSongs(results);
    setShowEmptyComponent(results.length === 0);
  };

  useEffect(() => {
    refreshSongs();
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
    songBus.on(SongBusEvent.SONG_DELETED, refreshSongs);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
      songBus.off(SongBusEvent.SONG_DELETED, refreshSongs);
    };
  }, []);

  useEffect(() => {
    refreshSongs();
  }, [query, sort, order]);

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
        showEmptyComponent={showEmptyComponent}
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

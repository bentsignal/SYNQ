import { View, StyleSheet, Text } from "react-native";
import SongList from "../lists/song/SongList";
import { PageType, SongType, SortType, SourceType } from "@/src/constants/Types";
import { useEffect } from "react";
import { useState } from "react";
import { getPlaylistSongs } from "@/src/controllers/PlaylistController";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import { Styles as MainStyles } from "@/src/constants/Styles";
import { Colors } from "@/src/constants/Colors";
import songBus from "@/src/events/song/Bus";
import { SongBusEvent } from "@/src/events/song/Events";
import QueryWrapper from "../lists/query/Wrapper";

export default function Songs () {

  const [songs, setSongs] = useState<SongType[]>([]);
  const [showEmptyComponent, setShowEmptyComponent] = useState(false);
  const [query, setQuery] = useState('');

  const refreshSongs = async () => {
    const results = await getPlaylistSongs(
      1,
      PageType.LIBRARY,
      SortType.NEWEST,
      query
    );
    setSongs(results);
    setShowEmptyComponent(results.length === 0);
  }

  useEffect(() => {
    refreshSongs();
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
    songBus.on(SongBusEvent.SONG_DELETED, refreshSongs);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
      songBus.off(SongBusEvent.SONG_DELETED, refreshSongs);
    }
  }, []);

  useEffect(() => {
    refreshSongs();
  }, [query]);

  return (
    <View style={Local.container}>
      <SongList
        songs={songs}
        headerComponent={<QueryWrapper setQuery={setQuery} query={query} songList/>}
        showEmptyComponent={showEmptyComponent}
        pageType={PageType.LIBRARY}
        sourceId={1}
        sourceType={SourceType.PLAYLIST}
        emptyComponent={<Text style={Local.emptyText}>No songs in library</Text>}
      />
    </View> 
  );

}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  emptyText: {
    ...MainStyles.h5,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.text,
  },
});

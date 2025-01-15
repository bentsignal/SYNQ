import { View, StyleSheet, Text } from "react-native";
import SongList from "../lists/song/SongList";
import { PageType, SongType, SortType, SourceType } from "@/constants/Types";
import { useEffect } from "react";
import { useState } from "react";
import { getPlaylistSongs } from "@/lib/controllers/PlaylistController";
import playlistBus from "@/src/events/playlist/Bus";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import Styles from "../modals/Styles";
import { Styles as MainStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

export default function Songs () {

  const [songs, setSongs] = useState<SongType[]>([]);

  const refreshSongs = async () => {
    const results = await getPlaylistSongs(1, PageType.LIBRARY, SortType.NEWEST);
    setSongs(results);
  }

  useEffect(() => {
    refreshSongs();
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshSongs);
    }
  }, []);

  return (
    <View style={Local.container}>
      <SongList
        songs={songs}
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

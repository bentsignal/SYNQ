import { View, StyleSheet } from "react-native";
import SongList from "../lists/song/SongList";
import { PageType, SongType, SortType, SourceType } from "@/constants/Types";
import { useEffect } from "react";
import { useState } from "react";
import { getPlaylistSongs } from "@/lib/controllers/PlaylistController";
import playlistBus from "@/station/playlist/Bus";
import { PlaylistBusEvent } from "@/station/playlist/Events";

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
      />
    </View> 
  );

}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});

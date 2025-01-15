import { View, StyleSheet } from "react-native";
import PlaylistList from "@/src/components/lists/playlist"; 
import { useEffect, useState } from "react";
import { PageType, PlaylistType } from "@/constants/Types";
import playlistBus from "@/src/events/playlist";
import { getPlaylists } from "@/lib/controllers/PlaylistController";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";

const Playlists = () => {

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  const refreshPlaylists = async () => {
    try {
      const results = await getPlaylists();
      setPlaylists(results.filter(p =>p.id !== 1));
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

  useEffect(() => {
    refreshPlaylists();
  }, []);

  useEffect(() => {
    playlistBus.on(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_DELETED, refreshPlaylists);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshPlaylists);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_CREATED, refreshPlaylists);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_DELETED, refreshPlaylists);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshPlaylists);
    }
  }, []);

  return (
    <View style={Local.container}>
      <PlaylistList 
        playlists={playlists}
        pageType={PageType.LIBRARY}
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

export default Playlists;
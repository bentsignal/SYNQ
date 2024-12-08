import { View, StyleSheet } from "react-native";
import PlaylistList from "@/components/lists/playlist"; 
import { useEffect, useState } from "react";
import { PageType, PlaylistType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import playlistBus from "@/station/playlist";
import { getPlaylists } from "@/lib/PlaylistManager";

const Playlists = () => {

  const { numModified, homeState, libraryPlaylistSheet } = useGlobalContext();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  const refreshPlaylists = async () => {
    try {
      const results = await getPlaylists();
      setPlaylists(results);
    }
    catch (error) {
      console.log('error refreshing playlists:', error);
    }
  }

  // refresh playlist after changes are made
  useEffect(() => {
    const triggerRefresh = () => {
      refreshPlaylists();
    }
    playlistBus.on('playlistChangesMade', triggerRefresh);
    return () => {
      playlistBus.off('playlistChangesMade', triggerRefresh);
    };
  }, []);

  useEffect(() => {
    refreshPlaylists();
  }, [numModified, homeState]);

  return (
    <View style={Local.container}>
      <PlaylistList 
        playlists={playlists}
        pageType={PageType.LIBRARY}
        sheetRef={libraryPlaylistSheet}
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
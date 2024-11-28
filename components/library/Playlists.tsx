import { View, StyleSheet } from "react-native";
import PlaylistList from "@/components/lists/playlist"; 
import { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import PlaylistDataManager from "@/lib/data/PlaylistDataManager";
import { PageType, PlaylistType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import playlistBus from "@/station/playlistBus";

const Playlists = () => {

  const { numModified, homeState } = useGlobalContext();

  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);

  const refreshPlaylists = () => {
    const db = PlaylistDataManager.getInstance();
    db.getPlaylists().then((results) => {
      setPlaylists(results);
    });
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
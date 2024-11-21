import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Styles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import SongList from "@/components/lists/SongList";
import { PageType, SongType } from "@/constants/Types";
import SongDataManager from "@/lib/data/SongDataManager";
import * as FileSystem from "expo-file-system";
import { getSongByResult } from "@/lib/SongManager";
import { useGlobalContext } from "@/context/GlobalProvider";
import MiniPlayer from "@/components/player/MiniPlayer";
import TabBar from "@/components/TabBar";

const PlaylistView = () => {

  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { numModified, homeState } = useGlobalContext();
  const [songs, setSongs] = useState<SongType[]>([]);

  // updates song list when changes are detected
  useEffect(() => {
    try {
      const db = SongDataManager.getInstance();
      db.getSongs().then((results) => {
        let songs: SongType[] = [];
        let dir;
        // for (let i = results.length - 1; i >= 0; i--) {
        for (let i = 0; i < results.length; i++) {
          dir = `${FileSystem.documentDirectory}library/${results[i].id}`;
          const song = getSongByResult(results[i]);
          songs.push(song);
        }
        setSongs(songs);
      });
    }
    catch (error) {
      console.log(error);
    }
  }, [numModified, homeState]);

  return (
    <View style={Local.container}>
      <SongList songs={songs} pageType={PageType.LIBRARY}/>
      <View style={Local.miniPlayerContainer}>
        <MiniPlayer />
      </View>
      <TabBar />
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.body,
    flex: 1,
    backgroundColor: Colors.background,
  },
  miniPlayerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
});

export default PlaylistView;
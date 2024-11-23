import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
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
import SongListHeaderComponent from "@/components/SongListHeaderComponent";
import PlaylistDataManager from "@/lib/data/PlaylistDataManager";
import Overlay from "@/components/Overlay";
import SongOptions from "@/components/sheets/SongOptions";
import Header from "@/components/Header";
import BottomSheet from "@gorhom/bottom-sheet";

const PlaylistView = () => {

  const { 
    
    numModified, homeState, showSongOptions,
    showOverlay,

    setShowSongOptions,
  
  } = useGlobalContext();

  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [songCount, setSongCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const songOptionsSheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    console.log(id);
    if (id) {
      const db = PlaylistDataManager.getInstance();
      db.getPlaylistInfoById(parseInt(id as string)).then((result) => {
        setTitle(result?.name || '');
        setSongCount(result?.songCount || 0);
      });
    }
  }, [id]);

  // updates song list when changes are detected
  useEffect(() => {
    try {
      const db = PlaylistDataManager.getInstance();
      db.getSongsFromPlaylist(parseInt(id as string)).then((results) => {
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
    <View style={Local.wrapper}>
      <View style={Local.container}>
        <Header 
          scrollPosition={scrollPosition}
          title={title}
        />
        <View style={[Styles.bottomSheetWrapper, {pointerEvents: sheetOpen ? 'auto' : 'none'}]}>
          <SongOptions bottomSheetRef={songOptionsSheetRef} setIsOpen={setSheetOpen}/>
        </View>
        <Overlay show={showOverlay} activeOpacity={0.95}/>
        <SongList 
          songs={songs} 
          pageType={PageType.LIBRARY}
          sheetRef={songOptionsSheetRef}
          headerComponent={
            <SongListHeaderComponent 
              id={id as string}
              title={title} 
              songCount={songCount} 
              pageType={PageType.PLAYLIST}
            />
          }
          setScrollPosition={setScrollPosition}
        />
        <View style={Local.miniPlayerContainer}>
          <MiniPlayer />
        </View>
        <TabBar />
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'black',
  },
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
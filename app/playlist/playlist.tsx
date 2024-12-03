import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { Styles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import SongList from "@/components/lists/song";
import { PageType, SongType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import MiniPlayer from "@/components/player/MiniPlayer";
import TabBar from "@/components/TabBar";
import SongListHeader from "@/components/lists/song/Header";
import Overlay from "@/components/Overlay";
import Header from "@/components/Header";
import BottomSheet from "@gorhom/bottom-sheet";
import playlistBus from "@/station/playlistBus";
import SongSheet from '@/components/sheet/song';
import { getPlaylistInfo, getPlaylistSongs } from "@/lib/PlaylistManager";


const PlaylistView = ({id}: {id: string}) => {

  const { 
    
    numModified, homeState, showSongOptions,
    showOverlay,

    setShowSongOptions,
  
  } = useGlobalContext();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [songCount, setSongCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const songOptionsSheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getPlaylistInfo(parseInt(id));
        setTitle(result?.name || '');
        setSongCount(result?.songCount || 0);
      }
      catch (error) {
        console.log('error refreshing playlist info:', error);
      }
    }
  }

  const refreshSongs = async () => {
    try {
      const songs = await getPlaylistSongs(parseInt(id), PageType.LIBRARY);
      setSongs(songs);
    }
    catch (error) {
      console.log('error refreshing playlist songs:', error);
    }
  }

  // refresh song list and info when changes are are sent from emitter;
  useEffect(() => {
    const triggerRefresh = () => {
      refreshSongs();
      refreshInfo();
    }
    playlistBus.on('playlistChangesMade', triggerRefresh);
    return () => {
      playlistBus.off('playlistChangesMade', triggerRefresh);
    }
  }, []);

  useEffect(() => {
    refreshInfo();
  }, [id]);

  // updates song list when changes are detected
  useEffect(() => {
    refreshSongs();
  }, [numModified, homeState]);

  return (
    <View style={Local.wrapper}>
      <View style={Local.container}>
        <Header 
          scrollPosition={scrollPosition}
          title={title}
        />
        <View style={[Styles.bottomSheetWrapper, {pointerEvents: sheetOpen ? 'auto' : 'none'}]}>
          <SongSheet bottomSheetRef={songOptionsSheetRef} setIsOpen={setSheetOpen}/>
        </View>
        <Overlay show={showOverlay} activeOpacity={0.95}/>
        <SongList 
          songs={songs} 
          pageType={PageType.LIBRARY}
          sheetRef={songOptionsSheetRef}
          playlistId={id as string}
          headerComponent={
            <SongListHeader 
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
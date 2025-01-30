import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongList from "@/src/components/lists/song";
import { PageType, PlaylistType, SongType, SortType, SourceType, ArtistType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import MiniPlayer from "@/src/components/player/MiniPlayer";
import TabBar from "@/src/components/TabBar";
import ArtistHeader from "@/src/components/lists/artist/Header";
import Overlay from "@/src/components/Overlay";
import Header from "@/src/components/Header";
import { getArtistInfo } from "@/src/controllers/ArtistController";
import artistBus from "@/src/events/artist";
import { ArtistBusEvent } from "@/src/events/artist/Events";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { getSongsFromArtist } from "@/src/controllers/ArtistController";

const ArtistView = ({id}: {id: number}) => {

  const { showOverlay, haptic, setEditArtist } = useGlobalContext();

  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [artist, setArtist] = useState<ArtistType | null>(null);

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getArtistInfo(id);
        result.pageType = PageType.ARTIST;
        setArtist(result);
        setTitle(result?.name || '');
      }
      catch (error) {
        console.log('error refreshing playlist info:', error);
      }
    }
  }

  const refreshSongs = async () => {
    try {
      const songs = await getSongsFromArtist(id, SortType.NEWEST);
      setSongs(songs);
    }
    catch (error) {
      console.log('error refreshing playlist songs:', error);
    }
  }

  const triggerRefresh = () => {
    refreshSongs();
    refreshInfo();
  }

  // refresh song list and info when changes are are sent from emitter;
  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_MODIFIED, refreshInfo);
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, refreshSongs);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_MODIFIED, refreshInfo);
      artistBus.off(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, refreshSongs);
    }
  }, []);

  useEffect(() => {
    triggerRefresh();
  }, [id]);

  const handleMore = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditArtist(artist);
    try {
      TrueSheet.present('artist-sheet');
    }
    catch (error) {
      console.log('error snapping to artist sheet:', error);
    }
  }

  return (
    <View style={Local.wrapper}>
      <View style={Local.container}>
        <Header 
          scrollPosition={scrollPosition}
          title={title}
          showMore={true}
          handleMore={handleMore}
        />
        <Overlay show={showOverlay} activeOpacity={0.95}/>
        <SongList 
          songs={songs} 
          pageType={PageType.ARTIST}
          sourceId={id}
          sourceType={SourceType.ARTIST}
          headerComponent={
            <ArtistHeader 
              id={id}
              title={title} 
              pageType={PageType.ARTIST}
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

export default ArtistView;
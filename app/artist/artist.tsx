import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Styles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import SongList from "@/components/lists/song";
import { PageType, PlaylistType, SongType, SortType, SourceType, ArtistType } from "@/constants/Types";
import { useGlobalContext } from "@/context/GlobalProvider";
import MiniPlayer from "@/components/player/MiniPlayer";
import TabBar from "@/components/TabBar";
import SongListHeader from "@/components/lists/song/Header";
import ArtistHeader from "@/components/lists/artist/Header";
import Overlay from "@/components/Overlay";
import Header from "@/components/Header";
import playlistBus from "@/station/playlist";
import { getPlaylistInfo, getPlaylistSongs } from "@/lib/controllers/PlaylistController";
import { getArtistInfo } from "@/lib/controllers/ArtistController";
import { PlaylistBusEvent } from "@/station/playlist/Events";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from "@lodev09/react-native-true-sheet";

const ArtistView = ({id}: {id: string}) => {

  const { showOverlay, haptic, setEditArtist } = useGlobalContext();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [songCount, setSongCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [artist, setArtist] = useState<ArtistType | null>(null);

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getArtistInfo(parseInt(id));
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
      const songs = await getPlaylistSongs(parseInt(id), PageType.LIBRARY, SortType.NEWEST);
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
    playlistBus.on(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED, triggerRefresh);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, refreshInfo);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, refreshInfo);
    return () => {
      playlistBus.off(PlaylistBusEvent.PLAYLIST_CONTENT_MODIFIED, triggerRefresh);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONG_COUNT_MODIFIED, refreshInfo);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_NAME_MODIFIED, refreshInfo);
    }
  }, []);

  const loadPlaylist = async () => {
    const playlist = await getPlaylistInfo(parseInt(id));
    playlist.pageType = PageType.PLAYLIST;
    setPlaylist(playlist);
  }

  useEffect(() => {
    loadPlaylist();
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
          pageType={PageType.LIBRARY}
          sourceId={Number(id)}
          sourceType={SourceType.PLAYLIST}
          headerComponent={
            <ArtistHeader 
              id={id as string}
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
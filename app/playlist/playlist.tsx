import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongList from "@/src/components/lists/song";
import { PageType, PlaylistType, SongType, SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import SongListHeader from "@/src/components/lists/song/Header";
import Overlay from "@/src/components/Overlay";
import Header from "@/src/components/Header";
import playlistBus from "@/src/events/playlist";
import { getPlaylistInfo, getPlaylistSongs } from "@/src/controllers/PlaylistController";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const PlaylistView = ({id}: {id: number}) => {

  const { showOverlay, haptic, setEditPlaylist } = useGlobalContext();

  const insets = useSafeAreaInsets();
  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [songCount, setSongCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [duration, setDuration] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>(SortType.DATE);
  const [order, setOrder] = useState<SortOrder>(SortOrder.DESC);

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getPlaylistInfo(id);
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
      const songs = await getPlaylistSongs(
        id,
        PageType.LIBRARY,
        sort,
        order,
        query
      );
      setSongs(songs);
      const duration = songs.reduce((acc, song) => acc + (song.duration ?? 0), 0);
      setDuration(duration);
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
    const playlist = await getPlaylistInfo(id);
    playlist.pageType = PageType.PLAYLIST;
    setPlaylist(playlist);
  }

  useEffect(() => {
    loadPlaylist();
    triggerRefresh();
  }, [id]);

  useEffect(() => {
    refreshSongs();
  }, [query, sort, order]);

  const handleMore = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditPlaylist(playlist);
    try {
      TrueSheet.present('playlist-sheet');
    }
    catch (error) {
      console.log('error snapping to playlist sheet:', error);
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
          sourceId={id}
          sourceType={SourceType.PLAYLIST}
          sort={sort}
          order={order}
          query={query}
          headerComponent={
            <>
              <SongListHeader 
                id={id}
                title={title} 
                songCount={songCount} 
                pageType={PageType.PLAYLIST}
                duration={duration}
              />
              <QueryWrapper 
                setQuery={setQuery} 
                query={query} 
                setSort={setSort} 
                sort={sort} 
                order={order}
                setOrder={setOrder}
                songList
                showSortTypes={{
                  [SortType.TITLE]: true,
                  [SortType.ARTIST]: true,
                  [SortType.ALBUM]: true,
                  [SortType.DATE]: true,
                }}
              />
            </>
          }
          footerComponent={
            <View style={{height: 1000}} />
          }
          setScrollPosition={setScrollPosition}
        />
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
});

export default PlaylistView;
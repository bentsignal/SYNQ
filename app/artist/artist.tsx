import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongList from "@/src/components/lists/song";
import { PageType, PlaylistType, SongType, SortType, 
  SourceType, ArtistType, AlbumType, SortOrder } from "@/src/constants/Types";
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
import { getAlbumsFromArtist } from "@/src/controllers/AlbumController";
import { AlbumBusEvent } from "@/src/events/album/Events";
import albumBus from "@/src/events/album";
import { PlaylistBusEvent } from "@/src/events/playlist/Events";
import playlistBus from "@/src/events/playlist";
import AlbumList from "@/src/components/lists/album";
import TabSelector from "@/src/components/TabSelector";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const ArtistView = ({id}: {id: number}) => {

  const { showOverlay, haptic, setEditArtist } = useGlobalContext();

  const [songs, setSongs] = useState<SongType[]>([]);
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [title, setTitle] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [showEmptyComponent, setShowEmptyComponent] = useState(false);
  const [songsQuery, setSongsQuery] = useState('');
  const [albumsQuery, setAlbumsQuery] = useState('');
  const [songSort, setSongSort] = useState<SortType>(SortType.DATE);
  const [songOrder, setSongOrder] = useState<SortOrder>(SortOrder.DESC);
  const [albumSort, setAlbumSort] = useState<SortType>(SortType.ALBUM);
  const [albumOrder, setAlbumOrder] = useState<SortOrder>(SortOrder.ASC);

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
      const songs = await getSongsFromArtist(
        id, 
        songSort, 
        songOrder, 
        songsQuery
      );
      setSongs(songs);
      setShowEmptyComponent(songs.length === 0);
    }
    catch (error) {
      console.log('error refreshing playlist songs:', error);
    }
  }

  const refreshAlbums = async () => {
    try {
      const results = await getAlbumsFromArtist(
        id, 
        albumSort, 
        albumOrder, 
        albumsQuery
      );
      setAlbums(results);
    }
    catch (error) {
      console.log('error refreshing artist albums:', error);
    }
  }

  const triggerRefresh = () => {
    refreshSongs();
    refreshInfo();
    refreshAlbums();
  }

  useEffect(() => {
    refreshSongs();
  }, [songsQuery, songSort, songOrder]);

  useEffect(() => {
    refreshAlbums();
  }, [albumsQuery, albumSort, albumOrder]);

  useEffect(() => {
    if (tabIndex === 0) {
      setAlbumsQuery('');
    }
    else {
      setSongsQuery('');
    }
  }, [tabIndex]);

  // refresh song list and info when changes are are sent from emitter;
  useEffect(() => {
    artistBus.on(ArtistBusEvent.ARTIST_MODIFIED, refreshInfo);
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, refreshSongs);
    albumBus.on(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
    albumBus.on(AlbumBusEvent.ALBUM_DELETED, refreshAlbums);
    albumBus.on(AlbumBusEvent.ALBUM_MODIFIED, refreshAlbums);
    playlistBus.on(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshAlbums);
    return () => {
      artistBus.off(ArtistBusEvent.ARTIST_MODIFIED, refreshInfo);
      artistBus.off(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, refreshSongs);
      albumBus.off(AlbumBusEvent.ALBUM_CREATED, refreshAlbums);
      albumBus.off(AlbumBusEvent.ALBUM_DELETED, refreshAlbums);
      albumBus.off(AlbumBusEvent.ALBUM_MODIFIED, refreshAlbums);
      playlistBus.off(PlaylistBusEvent.PLAYLIST_SONGS_IMPORTED, refreshAlbums);
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
        {tabIndex === 0 && (
          <SongList 
            songs={songs} 
            pageType={PageType.ARTIST}
            sourceId={id}
            sourceType={SourceType.ARTIST}
            sort={songSort}
            order={songOrder}
            query={songsQuery}
            showEmptyComponent={showEmptyComponent}
            emptyComponent={<Text style={Local.emptyText}>No songs in library</Text>}
            headerComponent={
              <>
                <ArtistHeader 
                  id={id}
                  title={title} 
                  pageType={PageType.ARTIST}
                />
                <TabSelector 
                  tabs={['Songs', 'Albums']}
                  index={tabIndex}
                  onSelect={setTabIndex}
                />
                <QueryWrapper 
                  setQuery={setSongsQuery} 
                  query={songsQuery} 
                  songList
                  setSort={setSongSort}
                  sort={songSort}
                  order={songOrder}
                  setOrder={setSongOrder}
                  showSortTypes={{
                    [SortType.TITLE]: true,
                    [SortType.ALBUM]: true,
                  }}
                />
              </>
            }
            footerComponent={<View style={{height: 1000}}/>}
            setScrollPosition={setScrollPosition}
          />
        )}
        {tabIndex === 1 && (
          <AlbumList
            albums={albums}
            pageType={PageType.LIBRARY}
            headerComponent={
              <>
                <ArtistHeader 
                  id={id}
                  title={title} 
                  pageType={PageType.ARTIST}
                />
                <TabSelector 
                  tabs={['Songs', 'Albums']}
                  index={tabIndex}
                  onSelect={setTabIndex}
                />
                <QueryWrapper 
                  setQuery={setAlbumsQuery} 
                  query={albumsQuery} 
                  setSort={setAlbumSort}
                  sort={albumSort}
                  order={albumOrder}
                  setOrder={setAlbumOrder}
                  showSortTypes={{
                    [SortType.ALBUM]: true,
                    [SortType.YEAR]: true,
                  }}
                />
              </>
            }
            footerComponent={<View style={{height: 1000}}/>}
            emptyComponent={<Text style={Local.emptyText}>No albums in library</Text>}
            showEmptyComponent={albums.length === 0}
          />
        )}
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
  emptyText: {
    ...Styles.h5,
    textAlign: 'center',
    marginTop: 20,
    color: Colors.text,
  },
});

export default ArtistView;
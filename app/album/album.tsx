import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Styles } from "@/src/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import SongList from "@/src/components/lists/song";
import { PageType, AlbumType, SongType, 
  SortType, SourceType, ArtistType, SortOrder } from "@/src/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import AlbumHeader from "@/src/components/lists/album/Header";
import Overlay from "@/src/components/Overlay";
import Header from "@/src/components/Header";
import { getAlbumInfo } from "@/src/controllers/AlbumController";
import albumBus from "@/src/events/album";
import { AlbumBusEvent } from "@/src/events/album/Events";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { getSongsFromAlbum } from "@/src/controllers/AlbumController";
import ArtistItem from "@/src/components/lists/artist/ArtistItem";
import { getArtistsFromAlbum } from "@/src/controllers/AlbumController";
import Animated, { useAnimatedStyle, 
  withTiming, useSharedValue } from "react-native-reanimated";
import QueryWrapper from "@/src/components/lists/query/Wrapper";

const AlbumView = ({id}: {id: number}) => {

  const { showOverlay, haptic, setEditAlbum } = useGlobalContext();

  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [count, setCount] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>(SortType.TRACK);
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASC);

  const artistListOpacity = useSharedValue(0);

  const artistListAnimatedStyle = useAnimatedStyle(() => ({
    opacity: artistListOpacity.value,
  }));

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getAlbumInfo(id);
        result.pageType = PageType.ALBUM;
        setAlbum(result);
        setTitle(result?.name || '');
        setYear(result?.year);
        const artists = await getArtistsFromAlbum(id);
        setArtists(artists);
      }
      catch (error) {
        console.log('error refreshing album info:', error);
      }
    }
  }

  const refreshSongs = async () => {
    try {
      const songs = await getSongsFromAlbum(
        id, 
        sort, 
        order, 
        query
      );
      setSongs(songs);
      const duration = songs.reduce((acc, song) => acc + (song.duration ?? 0), 0);
      if (query === '') {
        setCount(songs.length);
        setDuration(duration);
      }
      artistListOpacity.value = withTiming(1, { duration: 500 });
    }
    catch (error) {
      console.log('error refreshing album songs:', error);
    }

  }

  const triggerRefresh = () => {
    refreshSongs();
    refreshInfo();
  }

  // refresh song list and info when changes are are sent from emitter;
  useEffect(() => {
    albumBus.on(AlbumBusEvent.ALBUM_MODIFIED, refreshInfo);
    albumBus.on(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, refreshSongs);
    return () => {
      albumBus.off(AlbumBusEvent.ALBUM_MODIFIED, refreshInfo);
      albumBus.off(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, refreshSongs);
    }
  }, []);

  useEffect(() => {
    triggerRefresh();
  }, [id]);

  useEffect(() => {
    refreshSongs();
  }, [query, sort, order]);

  const handleMore = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditAlbum(album);
    try {
      TrueSheet.present('album-sheet');
    }
    catch (error) {
      console.log('error snapping to album sheet:', error);
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
          pageType={PageType.ALBUM}
          sourceId={id}
          sourceType={SourceType.ALBUM}
          headerComponent={
            <>
              <AlbumHeader 
                id={id}
                title={title} 
                year={year}
                leadArtist={artists[0]}
                songCount={count}
                pageType={PageType.ALBUM}
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
                  [SortType.TRACK]: true,
                }}
              />
            </>
          }
          setScrollPosition={setScrollPosition}
          footerComponent={
            <Animated.View style={[Local.artistList, artistListAnimatedStyle]}>
              {artists.length > 0 && <Text style={Local.artistListTitle}>Artists</Text>}
              {artists.map((artist) => (
                <ArtistItem 
                  key={artist.id}
                  artist={artist}
                  allowInteraction={true}
                />
              ))}
            </Animated.View>
          }
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
  artistList: {
    width: '100%',
    height: 1000,
  },
  artistListTitle: {
    ...Styles.h4,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default AlbumView;

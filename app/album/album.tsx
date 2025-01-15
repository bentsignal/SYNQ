import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Styles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import SongList from "@/components/lists/song";
import { PageType, AlbumType, SongType, SortType, SourceType, ArtistType } from "@/constants/Types";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import MiniPlayer from "@/components/player/MiniPlayer";
import TabBar from "@/components/TabBar";
import AlbumHeader from "@/components/lists/album/Header";
import Overlay from "@/components/Overlay";
import Header from "@/components/Header";
import { getAlbumInfo } from "@/lib/controllers/AlbumController";
import albumBus from "@/src/events/album";
import { AlbumBusEvent } from "@/src/events/album/Events";
import * as Haptics from 'expo-haptics';
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { getSongsFromAlbum } from "@/lib/controllers/AlbumController";
import ArtistItem from "@/components/lists/artist/ArtistItem";
import { getArtistsFromAlbum } from "@/lib/controllers/AlbumController";

const AlbumView = ({id}: {id: string}) => {

  const { showOverlay, haptic, setEditAlbum } = useGlobalContext();

  const [songs, setSongs] = useState<SongType[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [artists, setArtists] = useState<ArtistType[]>([]);

  const refreshInfo = async () => {
    if (id) {
      try {
        const result = await getAlbumInfo(parseInt(id));
        result.pageType = PageType.ALBUM;
        setAlbum(result);
        setTitle(result?.name || '');
        setYear(result?.year);
        const artists = await getArtistsFromAlbum(parseInt(id));
        setArtists(artists);
      }
      catch (error) {
        console.log('error refreshing album info:', error);
      }
    }
  }

  const refreshSongs = async () => {
    try {
      const songs = await getSongsFromAlbum(parseInt(id), SortType.OLDEST);
      setSongs(songs);
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
          sourceId={Number(id)}
          sourceType={SourceType.ALBUM}
          headerComponent={
            <AlbumHeader 
              id={id as string}
              title={title} 
              year={year}
              pageType={PageType.ALBUM}
            />
          }
          setScrollPosition={setScrollPosition}
          footerComponent={
            <View style={Local.artistList}>
              {artists.length > 0 && <Text style={Local.artistListTitle}>Artists</Text>}
              {artists.map((artist) => (
                <ArtistItem 
                  key={artist.id}
                  artist={artist}
                  allowInteraction={true}
                />
              ))}
            </View>
          }
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
  artistList: {
    width: '100%',
  },
  artistListTitle: {
    ...Styles.h4,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default AlbumView;

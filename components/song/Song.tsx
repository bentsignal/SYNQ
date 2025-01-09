import { View, TouchableOpacity, Text, StyleSheet, Animated, 
  PanResponder, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { SongType } from '@/constants/Types';
import SongInfo from '@/components/song/SongInfo';
import Select from '@/components/Select';
import ListCover from '@/components/cover/ListCover';
import { BlurView } from 'expo-blur';
import CustomButton from '../CustomButton';
import Skeleton from '../Skeleton';
import { darkenColor } from '@/lib/controllers/ColorController';
import * as Haptics from 'expo-haptics';
import More from '@/components/More';
import { PageType, CoverType, ArtistType } from '@/constants/Types';
import { useActiveTrack } from "react-native-track-player";
import { getTrackFromSong, playTrack, 
  updateQueue, playAd, addToQueue } from '@/lib/controllers/PlayerController';
import { useThemeContext } from '@/context/ThemeProvider';
import { usePremiumContext } from '@/context/PremiumProvider';
import songBus from '@/station/song';
import { SongBusEvent, SongInfoModifiedEvent, SongCoverModifiedEvent } from '@/station/song/Events';
import { usePlaybackContext } from '@/context/PlaybackProvider';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ArtistToggledOnSongEvent, ArtistBusEvent } from '@/station/artist/Events';
import { getArtistsFromSong } from '@/lib/controllers/ArtistController';
import artistBus from '@/station/artist';
import albumBus from '@/station/album';
import { AlbumBusEvent, AlbumToggledOnSongEvent } from '@/station/album/Events';
import { getAlbumCover } from '@/lib/controllers/AlbumController';

type SongProps = {
  song: SongType, 
  fadeCover: boolean, 
  fadeSong: boolean,
}

export default function Song({ song, fadeCover, fadeSong }: SongProps) {

  const [selected, setSelected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const [_, forceUpdate] = useState(0);
  const [updates, setUpdates] = useState(0);

  const track = useActiveTrack();

  const { 

    selectEnabled, selectedSongs, results,
    showSongOptions,
    haptic, adPlaying, adURL, shouldPlayAd,

    setSelectedSongs, setShowSongOptions,
    setEditSong, setAdPlaying,

  } = useGlobalContext(); 

  const { shuffle, sourceType, sourceId, setSourceType, setSourceId } = usePlaybackContext();
  const { premium } = usePremiumContext();
  const { theme } = useThemeContext();

  let blur = false;
  let message = false
  if (results && results[0] && results[1] && results[0].id && results[1].id) {
    if (!premium) {
      if (results[0].id != song.id) {
        blur = true;
      }
      if (results[1].id == song.id) {
        message = true;
      }
    }
  }

  let bg = Colors.song;
  // if (track !== null && song.id == track.id) {
  //   bg = theme;
  // }
  if (blur) {
    bg = Colors.background;
  }

  useEffect(() => {
    setSelected(false);
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled]);

  useEffect(() => {
    songBus.on(SongBusEvent.SONG_INFO_MODIFIED, updateSongInfo);
    songBus.on(SongBusEvent.SONG_COVER_MODIFIED, updateSongCover);
    artistBus.on(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, updateArtistInfo);
    albumBus.on(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, updateAlbumInfo);
    return () => {
      songBus.off(SongBusEvent.SONG_INFO_MODIFIED, updateSongInfo);
      songBus.off(SongBusEvent.SONG_COVER_MODIFIED, updateSongCover);
      artistBus.off(ArtistBusEvent.ARTIST_TOGGLED_ON_SONG, updateArtistInfo);
      albumBus.off(AlbumBusEvent.ALBUM_TOGGLED_ON_SONG, updateAlbumInfo);
    }
  }, []);

  let disablePlay = false;
  if (song.pageType && [PageType.IMPORT, PageType.QUEUE].includes(song.pageType)) { 
    disablePlay = true;
  }

  const updateAlbumInfo = async (data: AlbumToggledOnSongEvent) => {
    if (data.songId === Number(song.id)) {
      if (song.pageType === PageType.IMPORT) {
        if (data.add) {
          const cover = await getAlbumCover(data.albumId);
          if (song.info.metadata?.artwork !== undefined) {
            song.info.metadata.artwork = cover;
          }
          else {
            song.info.metadata = {
              name: '',
              artist: '',
              album: '',
              artwork: cover,
            };
          }
          setUpdates(prev => prev + 1);
        }
        else {
          if (song.info.metadata?.artwork !== undefined) {
            song.info.metadata.artwork = '';
          }
          else {
            song.info.metadata = {
              name: '',
              artist: '',
              album: '',
              artwork: '',
            };
          }
          setUpdates(prev => prev + 1);
        }
      }
      else {
        setUpdates(prev => prev + 1);
      }
    }
  }

  const updateArtistInfo = async (data: ArtistToggledOnSongEvent) => {
    if (data.songId === Number(song.id)) {
      let artists: ArtistType[] = [];
      if (song.pageType === PageType.IMPORT) {
        artists = song.importArtists ?? [];
      }
      else {
        artists = await getArtistsFromSong(Number(song.id));
      }
      song.info.metadata.artist = artists.map(artist => artist.name).join(', ');
      forceUpdate(prev => prev + 1);
    }
  }

  const updateSongInfo = async (data: SongInfoModifiedEvent) => {
    if (Number(song.id) === data.id) {
      if (data.title !== undefined && data.title !== null) {
        song.info.metadata.name = data.title;
      }
      if (data.artist !== undefined && data.artist !== null) {
        song.info.metadata.artist = data.artist;
      }
      if (data.album !== undefined && data.album !== null) {
        song.info.metadata.album = data.album;
      }
      forceUpdate(prev => prev + 1);
    }
  }

  const updateSongCover = async (data: SongCoverModifiedEvent) => {
    if (Number(song.id) === data.id) {
      if (data.type === PageType.IMPORT && data.cover) {
        song.info.metadata.artwork = data.cover;
      }
      forceUpdate(prev => prev + 1);
    }
  }

  const handlePlay = async () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const id = track?.id ? track.id : -1;
    // play ad if user is non premium and has passed ad threshold
    if (!premium && shouldPlayAd && !adPlaying) {
      setAdPlaying(true);
      await playAd(theme, adURL);
      const newTrack = await getTrackFromSong(song, theme);
      await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
      setSourceType(song.sourceType);
      setSourceId(song.sourceId);
      if (newTrack) {
        await addToQueue(newTrack);
      }
    }
    // if ad is not played, play song
    else if (id !== song.id && !adPlaying) {
      setAdPlaying(false);
      try {
        const newTrack = await getTrackFromSong(song, theme);
        if (newTrack) {
          await playTrack(newTrack);
          await updateQueue(song.id, shuffle, theme, song.sourceType, song.sourceId);
          setSourceType(song.sourceType);
          setSourceId(song.sourceId);
        }
      }
      catch (error) {
        console.log('error playing song: ', error);
      }
    }
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
  });

  return (
    <Animated.View 
      // {...panResponder.panHandlers}
      style={[Local.container, {
        transform: [{ translateX }]
      }]}>
      <TouchableOpacity 
        style={[Local.contentContainer, {
          backgroundColor: bg,
          opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6,
        }]}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={handlePlay}
      >
        <ListCover 
          image={song.info?.metadata?.artwork ? song.info.metadata.artwork : ''}
          type={CoverType.SONG}
          id={song.id}
          key={updates}
          fade={fadeCover}
          propOnLoad={() => {
            setLoaded(true);
          }}
        />
        <SongInfo info={song.info} name={song.name}/>
        {

          selectEnabled &&
          
          <Select 
            active={selected} 
            handlePress={() => {
              setSelected(!selected);
              let newSongs = [];
              let i = 0;
              if (!selected && !selectedSongs.includes(song.id)) {
                if (selectedSongs.length == 0) {
                  newSongs[0] = song.id;
                }
                else {
                  for (i = 0; i < selectedSongs.length; i++) {
                    newSongs[i] = selectedSongs[i];
                  }
                  newSongs[i] = song.id;
                }
                setSelectedSongs(newSongs);
              }
              else if (selected) {
                for (i = 0; i < selectedSongs.length; i++) {
                  if (selectedSongs[i] != song.id) {
                    newSongs.push(selectedSongs[i]);
                  }
                }
                setSelectedSongs(newSongs);
              }
            }}
          />

        }

        {

          !selectEnabled && song.pageType !== PageType.QUEUE &&

          <More 
            handlePress={() => {
              if (haptic) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEditSong(song);
              TrueSheet.present('song-sheet');
            }}
          />

        }
      </TouchableOpacity>
      {
        fadeSong &&
        <Skeleton
          show={!loaded}
          styles={Local.skeleton}
        />
      }
      <BlurView
        style={[Local.blur, {display: blur ? 'flex' : 'none'}]}
        intensity={20}
      >
        <View style={[Local.premiumMessageContainer, {display: message ? 'flex' : 'none'}]}>
          <Text style={Local.premiumMessageText}>
            Import multiple files with <Text style={{color: theme}}>Premium</Text>
          </Text>
          <CustomButton 
            title={'Learn More'}
            buttonWidth={150}
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            opacity={.90}
            handlePress={() => router.push('/premium')}
          />
        </View>
      </BlurView>
    </Animated.View>
  );

}

const Local = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    ...Styles.roundedContainer,
    ...Styles.listItem,
  },
  skeleton: {
    ...Styles.roundedContainer,
    position: 'absolute',
    width: '90%',
    height: 90,
    zIndex: 1,
  },
  blur: {
    ...Styles.roundedContainer,
    overflow: 'hidden',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    width: '90%',
    height: 90,
    padding: 15,
    zIndex: 2
  },
  premiumMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  premiumMessageText: {
    ...Styles.infoText,
    paddingBottom: 10,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10
  }
});
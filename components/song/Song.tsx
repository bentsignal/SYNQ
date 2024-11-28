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
import { ListCover } from '@/components/song/Cover';
import { BlurView } from 'expo-blur';
import CustomButton from '../CustomButton';
import Skeleton from '../Skeleton';
import { darkenColor } from '@/lib/ColorManager';
import * as Haptics from 'expo-haptics';
import More from '@/components/More';
import { PageType, CoverType } from '@/constants/Types';
import { useActiveTrack } from "react-native-track-player";
import { getTrackFromSong, playTrack, 
  updateQueue, playAd, addToQueue } from '@/lib/PlayerManager';
import BottomSheet from '@gorhom/bottom-sheet';
import { useThemeContext } from '@/context/ThemeProvider';

type SongProps = {
  song: SongType, 
  fadeCover: boolean, 
  fadeSong: boolean,
  sheetRef?: React.RefObject<BottomSheet>,
}

const Song = ({ song, fadeCover, fadeSong, sheetRef }: SongProps) => {

  const [selected, setSelected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const track = useActiveTrack();

  const { 

    selectEnabled, selectedSongs, results,
    premium, showSongOptions,
    haptic, shuffle, adPlaying, adURL, shouldPlayAd,

    setSelectedSongs, setShowSongOptions,
    setEditSong, setAdPlaying,

  } = useGlobalContext(); 

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

  let disablePlay = false;
  if (song.pageType && [PageType.IMPORT, PageType.QUEUE].includes(song.pageType)) { 
    disablePlay = true;
  }

  const Local = StyleSheet.create({
    container: {
      width: '100%',
    },
    contentContainer: {
      ...Styles.roundedContainer,
      ...Styles.listItem,
      backgroundColor: bg,
      opacity: !selectEnabled || (selectEnabled && selected) ? 1 : 0.6
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
      display: blur ? 'flex' : 'none',
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
      display: message ? 'flex' : 'none',
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
      if (!shuffle) {
        await updateQueue(song.id, shuffle, theme);
      }
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
          if (!shuffle) {
            await updateQueue(song.id, shuffle, theme);
          }
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
        style={Local.contentContainer}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={handlePlay}
      >
        <ListCover 
          image={song.info?.metadata?.artwork ? song.info.metadata.artwork : ''}
          type={CoverType.SONG}
          id={song.id}
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
              sheetRef?.current?.snapToIndex(0);
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
        style={Local.blur}
        intensity={20}
      >
        <View style={Local.premiumMessageContainer}>
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

export default Song;
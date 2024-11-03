import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { SongType } from '@/constants/Types';
import SongInfo from '@/components/song/SongInfo';
import Select from '@/components/song/Select';
import { ListCover } from '@/components/song/Cover';
import { BlurView } from 'expo-blur';
import CustomButton from '../CustomButton';
import Skeleton from '../Skeleton';
import { darkenColor } from '@/lib/ColorManager';
import * as Haptics from 'expo-haptics';
import More from '@/components/More';
import { getNextUp } from '@/lib/SongManager';
import { PageType } from '@/constants/Types';
import TrackPlayer, { useActiveTrack, Track } from "react-native-track-player";
import { getTrackFromSong } from '@/lib/PlayerManager';

const Song = ({song, fadeCover, fadeSong}: {
  song: SongType, 
  fadeCover: boolean, 
  fadeSong: boolean
}) => {

  const [selected, setSelected] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const track = useActiveTrack();

  const { 

    selectEnabled, selectedSongs, results,
    premium, showSongOptions, theme, 
    haptic, shuffle, 

    setSelectedSongs, setShowSongOptions,
    setEditSong, 

  } = useGlobalContext(); 

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

  useEffect(() => {
    setSelected(false);
    if (!selectEnabled) {
      setSelectedSongs([]);
    }
  }, [selectEnabled]);

  let bg = Colors.song;
  // if (track !== null && song.id == track.id) {
  //   bg = theme;
  // }
  if (blur) {
    bg = Colors.background;
  }

  let disablePlay = false;
  if (song.pageType && [PageType.IMPORT, PageType.QUEUE].includes(song.pageType)) { 
    disablePlay = true;
  }

  const Local = StyleSheet.create({
    mainContainer: {
      ...Styles.roundedContainer,
      alignSelf: 'stretch',
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: 90,
      marginBottom: 10,
      backgroundColor: bg,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
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
      paddingBottom: 5,
      textShadowColor: Colors.background,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10
    }
  });

  const handlePlay = async () => {
    const id = track?.id ? track.id : -1;
    if (id !== song.id) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      try {
        const newTrack = await getTrackFromSong(song, theme);
        if (newTrack) {
          await TrackPlayer.add(newTrack, 0);
          const queue = await TrackPlayer.getQueue();
          if (queue.length > 0) {
            await TrackPlayer.skip(0);
          }
          await TrackPlayer.play();
        }
      }
      catch (error) {
        console.log('error playing song: ', error);
      }
    }
  }

  return (
    <>
      <TouchableOpacity 
        style={Local.mainContainer}
        activeOpacity={disablePlay ? 1 : 0.8}
        disabled={disablePlay}
        onPress={handlePlay}
      >
        <ListCover 
          image={song.info?.metadata?.artwork ? song.info.metadata.artwork : ''}
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
              setShowSongOptions(!showSongOptions);
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
            title={'Sign Up'}
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            opacity={.90}
            handlePress={() => router.push('/premium')}
          />
        </View>
      </BlurView>
    </>
  );

}

export default Song;
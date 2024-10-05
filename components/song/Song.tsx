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
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const Song = ({song}: {song: SongType}) => {

  const [selected, setSelected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { 

    selectEnabled, selectedSongs, results,
    premium, showSongOptions, theme, 
    haptic, songPlaying,

    setSelectedSongs, setShowSongOptions,
    setEditSong, setSongPlaying,

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
  if (song.id == songPlaying) {
    bg = theme;
  }
  else if (blur) {
    bg = Colors.background;
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

  return (
    <>
      <TouchableOpacity 
        style={Local.mainContainer}
        activeOpacity={0.8}
        onPress={async () => {
          const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
          try {
            const contents = await FileSystem.readDirectoryAsync(libraryPath);            
            if (song.id != songPlaying && contents.includes(song.name)) {
              setSongPlaying(song.id);
              const path = `${libraryPath}/${song.name}`;
              const { sound } = await Audio.Sound.createAsync({ uri: path }, { shouldPlay: true });
              setSound(sound);
              sound.setOnPlaybackStatusUpdate((status) => {
                // if (status.isLoaded) {
                //   console.log(`Playback status: ${status.isPlaying ? 'playing' : 'paused'}`);
                // } else {
                //   console.log('Sound is not loaded');
                // }
              });
            } else {
              setSongPlaying('');
              if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
              }
            }
          } catch (error) {
            console.error('Error in audio playback:', error);
          }
        }}
      >
        <ListCover 
          image={song.info?.metadata?.artwork ? song.info.metadata.artwork : ''}
          id={song.id}
          propOnLoad={() => {
            setLoaded(true);
          }}
        />
        <SongInfo info={song.info} name={song.name}/>
        {

          selectEnabled 

          ? 
          
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

          : 

          <More 
            handlePress={() => {
              if (haptic) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setEditSong({
                "name": song.name, 
                "id": song.id, 
                "data": song.data, 
                "info": song.info
              });
              setShowSongOptions(!showSongOptions);
            }}
          />

        }
      </TouchableOpacity>
      <Skeleton
        show={!loaded}
        styles={Local.skeleton}
      />
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
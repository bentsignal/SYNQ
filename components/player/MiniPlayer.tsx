import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from "react";
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from "../song/Cover";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import { togglePlayPause } from "@/components/player/Util";
import PausePlayButtons from "./PausePlayButtons";

const MiniPlayer = () => {

  const { 

    theme, songPlaying, paused,
    newJump, sound,
    
    setPaused, setDuration, 
    setCurrentTime, setSound,

  } = useGlobalContext();

  const [currentId, setCurrentId] = useState<string | null>(null);

  const Local = StyleSheet.create({
    container: {
      ...Styles.roundedContainer,
      position: 'absolute',
      bottom: 0,
      height: 80,
      paddingRight: 10,
      paddingLeft: 10,
      marginBottom: 10,
      width: '90%',
      backgroundColor: theme,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      display: songPlaying ? 'flex' : 'none'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    playPauseButtonWrapper: {
      width: 35,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
    buttonWrapper: {
      paddingTop: 5,
      paddingBottom: 5,
    },
  });

  useEffect(() => {

    setCurrentId(songPlaying?.id);

    const playSong = async () => {
      if (songPlaying !== null) {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        const song = songPlaying;
        const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
        try {
          setSound(null);
          const contents = await FileSystem.readDirectoryAsync(libraryPath);  
          if (contents.includes(song.name)) {
            const path = `${libraryPath}/${song.name}`;
            const { sound } = await Audio.Sound.createAsync({ uri: path }, { shouldPlay: true });
            setSound(sound);
            setPaused(false);
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              setDuration(status.playableDurationMillis);
            }
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded) {
                setCurrentTime(status.positionMillis);
              }
            });
          } else {
            if (sound) {
              await sound.stopAsync();
              await sound.unloadAsync();
              setSound(null);
            }
          }
        } catch (error) {
          console.error('Error in audio playback:', error);
        }
      }
      else {
        console.log(2);
      }
    }

    playSong();

  }, [songPlaying]);

  useEffect(() => {
    const jump = async () => {
      try {
        if (newJump && sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            const newPosition: number = Number(newJump);
            await sound.setPositionAsync(newPosition);
          }
        }
      }
      catch (error) {
        console.error('Error setting new audio position:', error);
      }
    }
    jump();
  }, [newJump]);

  const getInfo = () => {
    if (songPlaying !== null && songPlaying.info) {
      return (
        <SongInfo 
          info={songPlaying.info} 
          name={songPlaying.name}
          showAlbum={false}
        />
      );
    }
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.95}
      onPress={() => router.push('/player')}
    >
      <ListCover id={songPlaying?.id} propOnLoad={() => {}}/>
      {getInfo()}
      <View style={Local.buttonContainer}>
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipLeft size={18}/>
        </TouchableOpacity>
        <PausePlayButtons 
          playSize={25}
          pauseHeight={25}
          pauseWidth={7}
          style={Local.playPauseButtonWrapper}
        />
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipRight size={18}/>
        </TouchableOpacity>
      </View>
      
    </TouchableOpacity>
  )
}

export default MiniPlayer;
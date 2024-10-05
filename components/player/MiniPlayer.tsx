import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from "react";
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";

const MiniPlayer = () => {
  const { 
    theme, songPlaying, paused,
    
    setPaused,

  } = useGlobalContext();

  const [sound, setSound] = useState<Audio.Sound | null>(null);


  const Local = StyleSheet.create({
    container: {
      ...Styles.roundedContainer,
      position: 'absolute',
      bottom: 0,
      height: 60,
      width: '90%',
      backgroundColor: theme,
      justifyContent: 'center',
      alignItems: 'center',
      display: songPlaying ? 'flex' : 'none'
    },
    buttonContainer: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10
    },
  });

  useEffect(() => {

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
            sound.setOnPlaybackStatusUpdate((status) => {
              // TODO: Add playback status update, probably used to update time remaining?
              // if (status.isLoaded) {
              //   console.log(`Playback status: ${status.isPlaying ? 'playing' : 'paused'}`);
              // } else {
              //   console.log('Sound is not loaded');
              // }
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

  const togglePlayPause = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          setPaused(true);
          await sound.pauseAsync();
        } else {
          setPaused(false);
          await sound.playAsync();
        }
      }
    }
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.8}
      onPress={() => {
        router.push('/player');
      }}
    >
      <TouchableOpacity
        style={Local.buttonContainer}
        onPress={togglePlayPause}
        activeOpacity={0.5}
      >
        {paused ? <PlayButton size={25}/> : <PauseButton size={25}/>}
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default MiniPlayer;
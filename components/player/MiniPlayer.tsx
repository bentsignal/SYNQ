import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from "react";

const MiniPlayer = () => {
  const { 
    
    theme, songPlaying
  
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
    }
  });

  useEffect(() => {

    const playSong = async () => {
      if (songPlaying !== null) {
        console.log(1);
        if (sound) {
          console.log(3);
          await sound.stopAsync();
          await sound.unloadAsync();
        }
        const song = songPlaying;
        const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
        try {
          console.log(4);
          setSound(null);
          const contents = await FileSystem.readDirectoryAsync(libraryPath);  
          console.log(6);          
          if (contents.includes(song.name)) {
            console.log(5);
            const path = `${libraryPath}/${song.name}`;
            const { sound } = await Audio.Sound.createAsync({ uri: path }, { shouldPlay: true });
            setSound(sound);
            sound.setOnPlaybackStatusUpdate((status) => {
              // TODO: Add playback status update, probably used to update time remaining?
              // if (status.isLoaded) {
              //   console.log(`Playback status: ${status.isPlaying ? 'playing' : 'paused'}`);
              // } else {
              //   console.log('Sound is not loaded');
              // }
            });
          } else {
            console.log(7);
            if (sound) {
              console.log(8);
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

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={0.8}
      onPress={() => {
        router.push('/player');
      }}
    >
      <Text>MiniPlayer</Text>
    </TouchableOpacity>
  )
}

export default MiniPlayer;
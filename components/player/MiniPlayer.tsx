import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router } from "expo-router";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from "react";
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SongInfo from '@/components/song/SongInfo';
import { ListCover } from "../song/Cover";

const MiniPlayer = () => {
  const { 

    theme, songPlaying, paused, fullPause,
    
    setPaused, setDuration, setCurrentTime,

  } = useGlobalContext();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
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
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10
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
    togglePlayPause();
  }, [fullPause]);

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
      activeOpacity={0.8}
      onPress={() => router.push('/player')}
    >
      <ListCover id={songPlaying?.id} propOnLoad={() => {}}/>
      {getInfo()}
      <TouchableOpacity
        style={Local.buttonContainer}
        onPress={togglePlayPause}
        activeOpacity={0.5}
      >
        {paused ? <PlayButton size={25}/> : <PauseButton height={25} width={7}/>}
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default MiniPlayer;
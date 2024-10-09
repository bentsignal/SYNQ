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
import PausePlayButtons from "./PausePlayButtons";

const MiniPlayer = () => {

  const { 

    theme, songPlaying, sound,
    
    setPaused, setSound,

  } = useGlobalContext();

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
          } 
          else {
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
    }

    playSong();

  }, [songPlaying]);

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
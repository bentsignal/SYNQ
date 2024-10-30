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
import { Themes, Colors } from "@/constants/Colors";
import TrackPlayer from "react-native-track-player";

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
        const song = songPlaying;
        const libraryPath = `${FileSystem.documentDirectory}library/${song.id}`;          
        try {
          const libraryPathExists = await FileSystem.getInfoAsync(libraryPath);
          if (!libraryPathExists.exists) {
            console.log('Library path does not exist:', libraryPath);
            return;
          }
          await TrackPlayer.reset();
          const contents = await FileSystem.readDirectoryAsync(libraryPath);  
          if (contents.includes(song.name)) {
            const audioPath = `${libraryPath}/${song.name}`;
            const coverPath = `${libraryPath}/cover_full.jpg`;
            await TrackPlayer.add({
              id: song.id,
              url: audioPath,
              title: song.info.metadata.name,
              artist: song.info.metadata.artist,
              artwork: coverPath,
            });
            await TrackPlayer.play();
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
          color={[''].includes(theme) ? 'black' : Colors.text}
        />
      );
    }
  }

  return (
    <TouchableOpacity 
      style={Local.container}
      activeOpacity={1}
      onPress={() => router.push('/player')}
    >
      <ListCover id={songPlaying?.id} propOnLoad={() => {}}/>
      {getInfo()}
      <View style={Local.buttonContainer}>
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipLeft size={18} color={[''].includes(theme) ? 'black' : Colors.text}/>
        </TouchableOpacity>
        <PausePlayButtons 
          playSize={25}
          pauseHeight={25}
          pauseWidth={7}
          style={Local.playPauseButtonWrapper}
          color={[''].includes(theme) ? 'black' : Colors.text}
        />
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipRight size={18} color={[''].includes(theme) ? 'black' : Colors.text}/>
        </TouchableOpacity>
      </View>
      
    </TouchableOpacity>
  )
}

export default MiniPlayer;
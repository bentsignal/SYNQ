import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import SongInfo from "@/components/song/SongInfo";
import Bar from "@/components/modals/Bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayerCover } from "@/components/song/Cover";
import More from "@/components/More";
import PauseButton from "@/components/player/PauseButton";
import PlayButton from "@/components/player/PlayButton";
import Time from "@/components/player/Time";
const Player = () => {

  const { 
    
    theme, songPlaying, paused, fullPause, 
    
    setPaused, setFullPause,
  
  } = useGlobalContext();
  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      alignItems: 'center',
    },
    infoContainer: {
      marginTop: 20,
      width: Dimensions.get('screen').width * 0.9,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    controlsContainer: {
      marginTop: 20,
      width: Dimensions.get('screen').width * 0.9,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pausePlay: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

  return (
    <View style={Local.container}>
      <Bar />
      <PlayerCover id={songPlaying?.id}/>
      <View style={Local.infoContainer}>
        <SongInfo info={songPlaying?.info} name={songPlaying?.name}/>
        <More handlePress={() => {}}/>
      </View>
      <Time />
      <View style={Local.controlsContainer}>
        <TouchableOpacity 
          onPress={() => setFullPause(!fullPause)}
          style={Local.pausePlay}
          activeOpacity={0.5}
        >
          {paused ? <PlayButton size={30}/> : <PauseButton size={30}/>}
        </TouchableOpacity>
      </View>
    </View>
  );

}

export default Player;
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import TrackPlayer, { State, usePlaybackState } from "react-native-track-player";

const PausePlayButtons = ({
  playSize,
  pauseHeight,
  pauseWidth,
  style,
  color,
}: {
  playSize: number;
  pauseHeight: number;
  pauseWidth: number;
  style: {};
  color?: string;
}) => {

  const { haptic } = useGlobalContext();

  const playbackState = usePlaybackState();
  const paused = playbackState.state === State.Paused;

  const togglePlayback = async () => {
    try {
      if (paused) {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        await TrackPlayer.play(); 
      }
      else {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        await TrackPlayer.pause();
      }
    }
    catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  return (
    <TouchableOpacity 
      onPress={togglePlayback}
      style={{...style}}
      activeOpacity={0.8}
    >
      {paused ? <PlayButton size={playSize} color={color}/> : <PauseButton height={pauseHeight} width={pauseWidth} color={color}/>}
    </TouchableOpacity>
  );
}

export const PauseButton = ({width, height, color}: {width: number, height: number, color?: string}) => {

  const Local = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
    },
    pause: {
      borderRadius: 10,
      height: height,
      width: width,
      backgroundColor: color ? color : Colors.text,
    },
  });

  return (
    <View style={Local.container}>
      <View style={Local.pause}/>
      <View style={Local.pause}/> 
    </View>
  );

}

export const PlayButton = ({size, color}: {size: number, color?: string}) => {
  return (
    <Svg 
      fill={color ? color : "#FFFFFF"} 
      viewBox="0 0 163.861 163.861" 
      width={size} 
      height={size} 
    >
      <Path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275
        c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z"/>
    </Svg>
  )
}

export default PausePlayButtons;
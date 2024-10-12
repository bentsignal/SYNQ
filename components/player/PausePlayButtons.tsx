import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { togglePlayPause } from "./Util";
import Svg, { Path } from 'react-native-svg';

const PausePlayButtons = ({
  playSize,
  pauseHeight,
  pauseWidth,
  style,
}: {
  playSize: number;
  pauseHeight: number;
  pauseWidth: number;
  style: {};
}) => {

  const { paused, setPaused, sound } = useGlobalContext();

  return (
    <TouchableOpacity 
      onPress={async () => {
        try {
          // update state instantly for improved perceived performance
          setPaused(!paused);
          const result = await togglePlayPause(sound);
          // paused state is flip flopped, switch it to correct state
          if (result === paused) {
            setPaused(result);
          }
        }
        catch (error) {
          setPaused(paused);
          console.error('Error toggling play/pause:', error);
        }
      }}
      style={{...style}}
      activeOpacity={0.8}
    >
      {paused ? <PlayButton size={playSize}/> : <PauseButton height={pauseHeight} width={pauseWidth}/>}
    </TouchableOpacity>
  );
}

export const PauseButton = ({width, height}: {width: number, height: number}) => {

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
      backgroundColor: Colors.text ,
    },
  });

  return (
    <View style={Local.container}>
      <View style={Local.pause}/>
      <View style={Local.pause}/> 
    </View>
  );

}

export const PlayButton = ({size}: {size: number}) => {
  return (
    <Svg 
      fill="#FFFFFF" 
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
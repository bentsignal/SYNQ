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
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import { Colors } from "@/constants/Colors";
import { getCoverImageData } from "@/lib/SongManager";
import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";

const Player = () => {

  const { 
    
    theme, songPlaying, paused, fullPause, 
    
    setPaused, setFullPause,
  
  } = useGlobalContext();

  const [bg, setBg] = useState(Colors.song);
  const [progressColor, setProgressColor] = useState(theme);

  const insets = useSafeAreaInsets();

  useEffect(() => {

    const callGetColors = async () => {
      if (songPlaying) {
        try {
          const data = await getCoverImageData(songPlaying.id);
          const uri = `data:image/jpeg;base64,${data}`;
          const colors = await getColors(uri, {
            fallback: Colors.song,
            cache: true,
            key: uri,
          });
          const cast = colors as IOSImageColors;
          setBg(cast.background);
          setProgressColor(cast.secondary);
        }
        catch (error) {
          console.log(error);
        }
      }
    }

    callGetColors();

  }, [songPlaying])

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      alignItems: 'center',
      backgroundColor: bg,
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
      gap: 15,
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
      <Time progressColor={progressColor}/>
      <View style={Local.controlsContainer}>
        <SkipLeft size={20}/>
        <TouchableOpacity 
          onPress={() => setFullPause(!fullPause)}
          style={Local.pausePlay}
          activeOpacity={0.5}
        >
          {paused ? <PlayButton size={30}/> : <PauseButton height={30} width={9}/>}
        </TouchableOpacity>
        <SkipRight size={20}/>
      </View>
    </View>
  );

}

export default Player;
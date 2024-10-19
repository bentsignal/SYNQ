import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import SongInfo from "@/components/song/SongInfo";
import Bar from "@/components/modals/Bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayerCover } from "@/components/song/Cover";
import More from "@/components/More";
import Time from "@/components/player/Time";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import { Colors } from "@/constants/Colors";
import { getCoverImageData } from "@/lib/SongManager";
import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import QueueButton from "@/components/player/QueueButton";
import ShuffleButton from "@/components/player/ShuffleButton";

const Player = () => {

  const { 
    
    theme, songPlaying
  
  } = useGlobalContext();

  const [bg, setBg] = useState(Colors.popup);
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

    // callGetColors();

  }, [songPlaying])

  const Local = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      alignItems: 'center',
      backgroundColor: bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    infoContainer: {
      marginTop: 20,
      width: Dimensions.get('screen').width * 0.9,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // backgroundColor: 'red',
      height: 40,
    },
    controlsContainer: {
      width: Dimensions.get('screen').width * 0.85,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 15,
    },
    centerControlsContainer: {
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
        <ShuffleButton/>
        <View style={Local.centerControlsContainer}>
          <SkipLeft size={20}/>
          <PausePlayButtons 
            playSize={30}
            pauseHeight={30}
            pauseWidth={9}
            style={Local.pausePlay}
          />
          <SkipRight size={20}/>
        </View>
        <QueueButton />
      </View>
    </View>
  );

}

export default Player;
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState, useRef } from "react";
import SongInfo from "@/components/song/SongInfo";
import Bar from "@/components/modals/Bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayerCover } from "@/components/song/Cover";
import More from "@/components/More";
import Time from "@/components/player/Time";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import { Colors } from "@/constants/Colors";
import { getCoverImageData, getSongById } from "@/lib/SongManager";
import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import QueueButton from "@/components/player/QueueButton";
import ShuffleButton from "@/components/player/ShuffleButton";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util"; 
import { useThemeContext } from "@/context/ThemeProvider";
import * as Haptics from 'expo-haptics';
import { PageType, SongType } from "@/constants/Types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();
  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const [bg, setBg] = useState(Colors.popup);
  const [progressColor, setProgressColor] = useState(theme);
  const [song, setSong] = useState<SongType | null>(null);

  const insets = useSafeAreaInsets();

  // get cover image colors
  useEffect(() => {

    const callGetColors = async () => {
      if (track) {
        try {
          const data = await getCoverImageData(track?.id);
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

    const getSong = async () => {
      const currentSong = await getSongById(track?.id);
      currentSong.pageType = PageType.PLAYER;
      setSong(currentSong); 
    }

    getSong();

    // callGetColors();

  }, [track])

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

  const getInfo = () => {
    if (track !== null && track !== undefined) {
      const info = {
        name: getFileName(track.url),
        metadata: {
          name: track.title,
          artist: track.artist,
          album: '',
          artwork: track.artwork,
        }
      }
      return (
        <SongInfo info={info} name={getFileName(track.url)}/>
      )
    }
  }

  const handleMore = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditSong(song);
    TrueSheet.present('song-sheet');
  }

  return (
    <>
      <View style={Local.container}>
        <Bar />
        <PlayerCover id={track?.id}/>
        <View style={Local.infoContainer}>
          {getInfo()}
          <More handlePress={handleMore}/>
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
    </>
  );

}

export default Player;
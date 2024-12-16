import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
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
import { getCoverImageData, getSongById } from "@/lib/controllers/SongController";
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
import { router } from "expo-router";
import LoopButton from "@/components/player/LoopButton";

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();
  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const [bg, setBg] = useState(Colors.popup);
  const [progressColor, setProgressColor] = useState(Colors.progress);
  const [song, setSong] = useState<SongType | null>(null);
  const [primary, setPrimary] = useState(theme);

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
          // setBg(cast.background);
          // setProgressColor(cast.secondary);
          setPrimary(cast.detail);
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

    callGetColors();

  }, [track])

  const Local = StyleSheet.create({
    bg: {
      position: 'absolute',
      height: Dimensions.get('screen').height,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    bgOverlay: {
      position: 'absolute',
      height: Dimensions.get('screen').height,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    container: {
      flex: 1,
      // paddingTop: insets.top,
      alignItems: 'center',
      // backgroundColor: bg,
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
      justifyContent: 'center',
      alignItems: 'center',
      gap: 15,
    },
    centerControlsContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 30,
    },
    bottomControlsContainer: {
      width: Dimensions.get('screen').width * 0.70,
      gap: 30,
      marginTop: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bottomControl: {
      minWidth: 50,
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
    router.push('/player/edit');
  }

  return (
    <>
      <Image 
        source={{ uri: track?.artwork }}
        blurRadius={100}
        style={Local.bg}
      />
      <View 
        style={Local.bgOverlay}
      />
      <View style={Local.container}>
        <Bar />
        <PlayerCover id={track?.id}/>
        <View style={Local.infoContainer}>
          {getInfo()}
          <More handlePress={handleMore}/>
        </View>
        <Time />
        <View style={Local.controlsContainer}>
          <View style={Local.centerControlsContainer}>
            <SkipLeft size={25}/>
            <PausePlayButtons 
              playSize={40}
              pauseHeight={40}
              pauseWidth={12}
              style={Local.pausePlay}
            />
            <SkipRight size={25}/>
          </View>
        </View>
        <View style={[Local.controlsContainer, Local.bottomControlsContainer]}>
          <View style={Local.bottomControl}>
            <ShuffleButton useBG={true}/>
          </View>
          <View style={Local.bottomControl}>
            <QueueButton />
          </View>
          <View style={Local.bottomControl}>
            <LoopButton useBG={true}/>
          </View>
        </View>
      </View>
    </>
  );

}

export default Player;
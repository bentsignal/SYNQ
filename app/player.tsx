import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import SongInfo from "@/components/song/SongInfo";
import Bar from "@/components/modals/Bar";
import { PlayerCover } from "@/components/song/Cover";
import More from "@/components/More";
import Time from "@/components/player/Time";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import { getSongById } from "@/lib/controllers/SongController";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import QueueButton from "@/components/player/QueueButton";
import ShuffleButton from "@/components/player/ShuffleButton";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util"; 
import * as Haptics from 'expo-haptics';
import { PageType, SongType } from "@/constants/Types";
import { router } from "expo-router";
import LoopButton from "@/components/player/LoopButton";
import LinearGradient from "react-native-linear-gradient";
import { getLuminanceFromImage, getPlayerGradientOpacity } from "@/lib/controllers/ColorController";
import Animated, {useSharedValue, withTiming, Easing} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();

  const track = useActiveTrack();

  const [song, setSong] = useState<SongType | null>(null);
  const [opacity, setOpacity] = useState(0.4);
  const containerOpacity = useSharedValue(0);
  const playerCoverOpacity = useSharedValue(0);
  const value = 0;

  useEffect(() => {
    containerOpacity.value = withTiming(1, {duration: 200, easing: Easing.inOut(Easing.quad)});
  }, []);

  // get cover image colors
  useEffect(() => {

    const callGetColors = async () => {
      if (track) {
        try {
          const luminance = await getLuminanceFromImage(track.artwork);
          const newOpacity = getPlayerGradientOpacity(luminance);
          setOpacity(newOpacity);
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
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      
    },
    overlay: {
      backgroundColor: typeof track?.artwork === 'string' ? 'transparent' : Colors.popup,
    },
    container: {
      flex: 1,
      alignItems: 'center',
    },
    infoContainer: {
      marginTop: 20,
      width: Dimensions.get('screen').width * 0.9,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    <Animated.View style={[{opacity: containerOpacity}, Local.container]}>
      <Image 
        source={{ uri: track?.artwork }}
        blurRadius={100}
        style={Local.bg}
      />
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0)',`rgba(${value}, ${value}, ${value}, ${opacity})`]}
        style={Local.bg}
      />
      <View style={[Local.bg, Local.overlay]}/>
      <View style={Local.container}>
        <Bar />
        <Animated.View style={{opacity: playerCoverOpacity}}>
          <PlayerCover id={track?.id} onLoad={() => {
            playerCoverOpacity.value = withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.quad)});
          }}/>
        </Animated.View>
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
    </Animated.View>
  );

}

export default Player;
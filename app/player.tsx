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
import { InfoType, PageType, SongType } from "@/constants/Types";
import { router } from "expo-router";
import LoopButton from "@/components/player/LoopButton";
import LinearGradient from "react-native-linear-gradient";
import { getLuminanceFromImage, getPlayerGradientOpacity } from "@/lib/controllers/ColorController";
import Animated, {useSharedValue, withTiming, Easing} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

type PlayerStateType = {
  gradientOpacity: number;
  info: InfoType;
}

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();

  const track = useActiveTrack();

  const containerOpacity = useSharedValue(0);
  const gradientPixelValue = 0;

  const [song, setSong] = useState<SongType | null>(null);
  const [playerState, setPlayerState] = useState<PlayerStateType>({
    gradientOpacity: 0.2,
    info: {
      name: getFileName(track?.url),
      metadata: {
        name: track?.title,
        artist: track?.artist,
        artwork: typeof track?.artwork === 'string' ? track?.artwork : '',
      }
    }
  });

  useEffect(() => {
    containerOpacity.value = withTiming(1, {duration: 200, easing: Easing.inOut(Easing.quad)});
  }, []);

  useEffect(() => {

    const getPlayerState = async () => {
      try {
        const opacity = await getOpacity();
        setPlayerState({
          gradientOpacity: opacity,
          info: {
            name: getFileName(track?.url),
            metadata: {
              name: track?.title,
              artist: track?.artist,
              artwork: typeof track?.artwork === 'string' ? track?.artwork : '',
            }
          }
        });
      }
      catch (error) {
        console.log(error);
      }
    }

    const getOpacity= async () => {
      if (!track) {
        return 0.2;
      }
      try {
        const luminance = await getLuminanceFromImage(track.artwork);
        const newOpacity = getPlayerGradientOpacity(luminance);
        return newOpacity;
      }
      catch (error) {
        console.log(error);
        return 0.2;
      }
    }

    const getSong = async () => {
      const currentSong = await getSongById(track?.id);
      currentSong.pageType = PageType.PLAYER;
      setSong(currentSong); 
    }

    getSong();
    getPlayerState();

  }, [track]);

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
        source={{ uri: playerState.info.metadata?.artwork }}
        blurRadius={100}
        style={Local.bg}
      />
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0)',`rgba(${gradientPixelValue}, ${gradientPixelValue}, ${gradientPixelValue}, ${playerState.gradientOpacity})`]}
        style={Local.bg}
      />
      <View style={[Local.bg, {
        backgroundColor: playerState.info.metadata.artwork === '' ? Colors.popup :'transparent',
      }]}/>
      <View style={Local.container}>
        <Bar />
        <PlayerCover uri={playerState.info.metadata?.artwork}/>
        <View style={Local.infoContainer}>
          <SongInfo 
            info={playerState.info}
            name={playerState.info.name}
            titleStyles={Local.title}
            artistStyles={Local.artist}
          />
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
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  artist: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 16,
    opacity: 0.5,
  }
});

export default Player;
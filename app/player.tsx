import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import SongInfo from "@/components/song/SongInfo";
import Bar from "@/components/modals/Bar";
import PlayerCover from "@/components/cover/PlayerCover";
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
import Animated, {useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { getTrackArtwork } from "@/lib/controllers/PlayerController";
import { CrossfadeImage } from "react-native-crossfade-image";
import { useAssets } from "expo-asset";
import ModalStyles from "@/components/modals/Styles";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();

  const track = useActiveTrack();

  const [assets, error] = useAssets([require('@/assets/images/popup.jpg')]);
  const [emptyImage, setEmptyImage] = useState<string>('transparent');

  const [song, setSong] = useState<SongType | null>(null);
  const [name, setName] = useState<string>(getFileName(track?.url));
  const [artist, setArtist] = useState<string>(track?.artist || '');
  const [title, setTitle] = useState<string>(track?.title || '');

  const containerOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0.2);
  const infoOpacity = useSharedValue(1);

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));
  const infoStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    flex: 1,
  }));

  useEffect(() => {
    if (error) {
      return;
    }
    if (assets) {
      setEmptyImage(assets[0].uri);
    }
  }, [assets]);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {duration: 200, easing: Easing.inOut(Easing.quad)});
  }, []);

  useEffect(() => {
    infoOpacity.value = withTiming(0, {duration: 250, easing: Easing.inOut(Easing.quad)}, () => {
      runOnJS(callUpdateInfo)();
    });
  }, [track]);
  
  const callUpdateInfo = async () => {
    await updateInfo();
    infoOpacity.value = withTiming(1, {duration: 250, easing: Easing.inOut(Easing.quad)});
  }

  const updateInfo = async () => {
    return new Promise((resolve, reject) => {
      setName(getFileName(track?.url));
      setArtist(track?.artist || '');
      setTitle(track?.title || '');
      resolve(true);
    });
  }

  useEffect(() => {

    const setGradientOpacity = async () => {
      try {
        const newGradientOpacity = await getOpacity();
        gradientOpacity.value = withTiming(newGradientOpacity, {
          duration: 500, 
          easing: Easing.inOut(Easing.quad)
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
      if (typeof track?.artwork !== 'string') {
        return 0;
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
    setGradientOpacity();

  }, [track]);

  const handleMore = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditSong(song);
    router.push('/player/edit');
  }

  const getBackgroundImage = () => {
    const artwork = getTrackArtwork(track);
    if (artwork !== 'transparent') {  
      return artwork;
    }
    return emptyImage;
  }

  return (
    <Animated.View style={[{opacity: containerOpacity}, Local.container]}>
      <CrossfadeImage 
        source={{ uri: getBackgroundImage() }}  
        blurRadius={100}
        duration={500}
        style={[Local.bg, {
          zIndex: 0,
          backgroundColor: Colors.popup
        }]}
      />
      <AnimatedLinearGradient 
        colors={['rgba(0, 0, 0, 0)',`rgb(0, 0, 0)`]}
        style={[Local.bg, gradientStyle, {
          zIndex: 1,
        }]}
      />
      <View style={Local.container}>
        <Bar />
        <PlayerCover uri={getTrackArtwork(track)}/>
        <View style={Local.infoContainer}>
          <Animated.View style={infoStyle}>
            <SongInfo
              info={{
                name: getFileName(track?.url),
                metadata: {
                  name: title,
                  artist: artist,
                }
              }}
              name={name}
              titleStyles={Local.title}
              artistStyles={Local.artist}
            />
          </Animated.View>
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
    ...ModalStyles.roundedTop,
    position: 'absolute',
    height: Dimensions.get('screen').height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    zIndex: 2,
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
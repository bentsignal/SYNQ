import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { useEffect, useState } from "react";
import SongInfo from "@/src/components/song/SongInfo";
import Bar from "@/src/components/modals/Bar";
import PlayerCover from "@/src/components/cover/PlayerCover";
import More from "@/src/components/More";
import Time from "@/src/components/player/Time";
import { SkipLeft, SkipRight } from "@/src/components/player/Skip";
import { getSongById } from "@/src/controllers/SongController";
import PausePlayButtons from "@/src/components/player/PausePlayButtons";
import QueueButton from "@/src/components/player/QueueButton";
import ShuffleButton from "@/src/components/player/ShuffleButton";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util"; 
import * as Haptics from 'expo-haptics';
import { PageType, SongType } from "@/src/constants/Types";
import { router } from "expo-router";
import LoopButton from "@/src/components/player/LoopButton";
import LinearGradient from "react-native-linear-gradient";
import { getLuminanceFromImage, getPlayerGradientOpacity } from "@/src/controllers/ColorController";
import Animated, {useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS} from "react-native-reanimated";
import { Colors } from "@/src/constants/Colors";
import { getTrackArtwork } from "@/src/controllers/PlayerController";
import { CrossfadeImage } from "react-native-crossfade-image";
import { useAssets } from "expo-asset";
import ModalStyles from "@/src/components/modals/Styles";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Player = () => {

  const { haptic, setEditSong } = useGlobalContext();

  const track = useActiveTrack();

  const [assets, error] = useAssets([require('@/src/assets/images/popup.jpg')]);
  const [emptyImage, setEmptyImage] = useState<string>('transparent');

  const [song, setSong] = useState<SongType | null>(null);
  const [name, setName] = useState<string>(getFileName(track?.url));
  const [artist, setArtist] = useState<string>(track?.artist || '');
  const [title, setTitle] = useState<string>(track?.title || '');

  const containerOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0.4);
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
      const base = .2;
      if (!track) {
        return base;
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
        return base;
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

  const handleAddToPlaylist = () => {
    setEditSong(song);
    router.push('/playlist/add');
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
              fileName={getFileName(track?.url)}
              title={title}
              artist={artist}
              color={Colors.text}
              titleStyles={[Local.title, Local.dropShadow]}
              artistStyles={[Local.artist, Local.dropShadow]}
            />
          </Animated.View>
          <TouchableOpacity onPress={handleAddToPlaylist} style={Local.addWrapper}>
            <Image source={require('@/src/assets/icons/add.png')} style={Local.add}/>
          </TouchableOpacity>
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
    marginTop: 10,
    marginBottom: 10
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
  },
  add: {
    width: 25,
    height: 25,
    tintColor: Colors.text,
  },
  addWrapper: {
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
  },
  dropShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  }
});

export default Player;
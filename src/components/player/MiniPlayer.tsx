import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Styles } from "@/src/constants/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { router } from "expo-router";
import SongInfo from '@/src/components/song/SongInfo';
import ListCover from "@/src/components/cover/ListCover";
import { SkipLeft, SkipRight } from "@/src/components/player/Skip";
import PausePlayButtons from "./PausePlayButtons";
import { Colors, Themes } from "@/src/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util";
import { CoverType } from "@/src/constants/Types";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { getDisabledColor, adjustLightness, darkenColor } from "@/src/controllers/ColorController";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { getAbsoluteSongCover } from "@/src/controllers/SongController";
import { CrossfadeImage } from "react-native-crossfade-image";
import { getTrackArtwork } from "@/src/controllers/PlayerController";
import { useAssets } from "expo-asset";

const MiniPlayer = () => {

  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const opacity = useSharedValue(0);
  const coverStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const [coverImage, setCoverImage] = useState('');
  const [emptyCover, setEmptyCover] = useState(false);
  const [assets, error] = useAssets([require('@/src/assets/images/popup.jpg')]);
  const [emptyImage, setEmptyImage] = useState<string>('transparent');

  useEffect(() => {
    if (error) {
      return;
    }
    if (assets) {
      setEmptyImage(assets[0].uri);
    }
  }, [assets]);

  const loadCover = async () => {
    try {
      const cover = await getAbsoluteSongCover(track?.id);
      if (cover) {
        setCoverImage(cover);
        setEmptyCover(false);
      }
      else {
        setCoverImage('');
        setEmptyCover(true);
      }
    }
    catch (error) {
      console.log('error loading song cover:', error);
    }
  }

  const getBackgroundImage = () => {
    const artwork = getTrackArtwork(track);
    if (artwork !== 'transparent') {  
      return artwork;
    }
    return emptyImage;
  }

  useEffect(() => {
    loadCover();
    setTimeout(() => {
      opacity.value = withTiming(track ? 1 : 0, { duration: 200 });
    }, 200);
  }, [track]);

  const textColor = Colors.text;//darkenColor(theme, 50, 30);

  return (
    <View style={Local.wrapper}>
      <TouchableOpacity 
        style={[Local.container, {
          display: track ? 'flex' : 'none',
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }]}
        activeOpacity={1}
        onPress={() => router.push('/player')}
      >
        <CrossfadeImage 
          source={{ uri: getBackgroundImage() }}
          blurRadius={100}
          duration={500}
          style={[Local.container, Local.fadeImage]}
        />
        <Animated.View style={coverStyle}>
          <ListCover 
            image={coverImage}
            type={CoverType.SONG}
            propOnLoad={() => {}}
            empty={emptyCover}
          />
        </Animated.View>
        <SongInfo 
          fileName={getFileName(track?.url)}
          title={track?.title}
          artist={track?.artist}
          showAlbum={false}
          color={textColor}
          titleStyles={[Local.title, Local.dropShadow]}
          artistStyles={[Local.artist, Local.dropShadow]}
        />
        <View style={Local.buttonContainer}>
          <TouchableOpacity 
            style={Local.buttonWrapper}
            onPress={() => {}}
          >
            <SkipLeft size={16} color={textColor}/>
          </TouchableOpacity>
          <PausePlayButtons 
            playSize={25}
            pauseHeight={25}
            pauseWidth={7}
            style={Local.playPauseButtonWrapper}
            color={textColor}
          />
          <TouchableOpacity 
            style={Local.buttonWrapper}
            onPress={() => {}}
          >
            <SkipRight size={16} color={textColor}/>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

}

const Local = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    ...Styles.roundedContainer,
    position: 'absolute',
    bottom: 0,
    height: 80,
    paddingRight: 5,
    paddingLeft: 10,
    marginBottom: 10,
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fadeImage: {
    zIndex: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 800,
    height: '100%',
    backgroundColor: Colors.popup,

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  playPauseButtonWrapper: {
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  buttonWrapper: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  title: {
    ...Styles.h5,
    color: Colors.text,
  },
  artist: {
    ...Styles.sub,
    color: Colors.text,
  },
  dropShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  }
});


export default MiniPlayer;
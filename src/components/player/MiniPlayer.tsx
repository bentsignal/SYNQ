import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/src/context/GlobalProvider";
import { router } from "expo-router";
import SongInfo from '@/src/components/song/SongInfo';
import ListCover from "@/src/components/cover/ListCover";
import { SkipLeft, SkipRight } from "@/src/components/player/Skip";
import PausePlayButtons from "./PausePlayButtons";
import { Colors, Themes } from "@/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { getFileName } from "@/lib/Util";
import { CoverType } from "@/constants/Types";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { getDisabledColor, adjustLightness, darkenColor } from "@/lib/controllers/ColorController";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const MiniPlayer = () => {

  const { theme } = useThemeContext();

  const track = useActiveTrack();

  const opacity = useSharedValue(0);
  const coverStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(track ? 1 : 0, { duration: 200 });
    }, 200);
  }, [track]);

  const textColor = darkenColor(theme, 50, 30);

  return (
    <TouchableOpacity 
      style={[Local.container, { 
        backgroundColor: theme, 
        display: track ? 'flex' : 'none'
      }]}
      activeOpacity={1}
      onPress={() => router.push('/player')}
    >
      <Animated.View style={coverStyle}>
        <ListCover 
          id={track?.id} 
          type={CoverType.SONG}
          propOnLoad={() => {}}
        />
      </Animated.View>
      <SongInfo 
        info={{
          name: getFileName(track?.url),
          metadata: {
            name: track?.title,
            artist: track?.artist,
            album: '',
            artwork: track?.artwork,
          }
        }}
        name={getFileName(track?.url)}
        showAlbum={false}
        color={textColor}
      />
      <View style={Local.buttonContainer}>
        <TouchableOpacity 
          style={Local.buttonWrapper}
          onPress={() => {}}
        >
          <SkipLeft size={18} color={textColor}/>
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
          <SkipRight size={18} color={textColor}/>
        </TouchableOpacity>
      </View>
      
    </TouchableOpacity>
  );

}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    position: 'absolute',
    bottom: 0,
    height: 80,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: 10,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default MiniPlayer;
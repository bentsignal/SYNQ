import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';
import { skipLeft, skipRight, playAd } from '@/lib/PlayerManager';
import { useGlobalContext } from '@/context/GlobalProvider';
import * as Haptics from 'expo-haptics';
import { useThemeContext } from '@/context/ThemeProvider';

const Shape = ({size, color}: {size: number, color?: string}) => {
  return (
    <>
      <PlayButton size={size} color={color} />
      <View style={Local.second}>
        <PlayButton size={size} color={color} />
      </View>
    </>
  );
}

export const SkipRight = ({size, color}: {size: number, color?: string}) => {

  const { premium, shuffle, haptic, 
    adPlaying, adURL, setAdPlaying, shouldPlayAd } = useGlobalContext();
  const { theme } = useThemeContext();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={Local.container}
      onPress={async () => {
        if (!premium && shouldPlayAd && !adPlaying) {
          setAdPlaying(true);
          await playAd(theme, adURL);
        }
        else if (!adPlaying) {
          if (haptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          await skipRight(shuffle, theme, haptic);
        }
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size, color}: {size: number, color?: string}) => {

  const { premium, adPlaying, theme, adURL, setAdPlaying, shouldPlayAd, haptic } = useGlobalContext();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={async () => {
        if (!premium && shouldPlayAd && !adPlaying) {
          setAdPlaying(true);
          await playAd(theme, adURL);
        }
        else if (!adPlaying) {
          if (haptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          await skipLeft();
        }
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
}

const Local = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  flipped: {
    transform: [{rotate: '180deg'}]
  },
  second: {
    transform: [{translateX: -5}]
  }
});

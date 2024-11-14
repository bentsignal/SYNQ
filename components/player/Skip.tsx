import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';
import { skipLeft, skipRight } from '@/lib/PlayerManager';
import { useGlobalContext } from '@/context/GlobalProvider';

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

  const { shuffle, theme, haptic, adPlaying } = useGlobalContext();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={Local.container}
      onPress={() => {
        if (!adPlaying) {
          skipRight(shuffle, theme, haptic);
        }
      }}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size, color}: {size: number, color?: string}) => {

  const { adPlaying } = useGlobalContext();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={() => {
        if (!adPlaying) skipLeft();
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

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';

export const SkipRight = ({size}: {size: number}) => {

  const Local = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    second: {
      transform: [{translateX: -5}]
    }
  });

  return (
    <TouchableOpacity style={Local.container}>
      <PlayButton size={size} />
      <View style={Local.second}>
        <PlayButton size={size} />
      </View>
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size}: {size: number}) => {
  return (
    <TouchableOpacity style={{transform: [{rotate: '180deg'}]}}>
      <SkipRight size={size} />
    </TouchableOpacity>
  );
}

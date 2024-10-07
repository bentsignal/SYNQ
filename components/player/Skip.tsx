import { PlayButton } from './PausePlayButtons';
import { View, StyleSheet } from 'react-native';

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
    <View style={Local.container}>
      <PlayButton size={size} />
      <View style={Local.second}>
        <PlayButton size={size} />
      </View>
    </View>
  );
}

export const SkipLeft = ({size}: {size: number}) => {
  return (
    <View style={{transform: [{rotate: '180deg'}]}}>
      <SkipRight size={size} />
    </View>
  );
}

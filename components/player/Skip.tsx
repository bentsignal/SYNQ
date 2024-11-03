import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { jump } from '@/lib/SoundManager';
import { getSongById, getNextUp } from '@/lib/SongManager';
import TrackPlayer from 'react-native-track-player';

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

  const handlePress = async () => {
    await TrackPlayer.skipToNext();
    await TrackPlayer.play();
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={Local.container}
      onPress={handlePress}
    >
      <Shape size={size} color={color} />
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size, color}: {size: number, color?: string}) => {

  const handlePress = async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      const index = await TrackPlayer.getActiveTrackIndex();
      if (progress.position < 3 && index !== 0) {
        await TrackPlayer.skipToPrevious();
        await TrackPlayer.play();
      }
      else {
        await TrackPlayer.seekTo(0);
      }
    }
    catch (error) {
      console.log('error skipping left: ', error);
    }
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={handlePress}
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

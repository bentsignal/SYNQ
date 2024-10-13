import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { jump } from '@/lib/SoundManager';
import { getSongById } from '@/lib/SongManager';


const Shape = ({size}: {size: number}) => {
  return (
    <>
      <PlayButton size={size} />
      <View style={Local.second}>
        <PlayButton size={size} />
      </View>
    </>
  );
}

export const SkipRight = ({size}: {size: number}) => {

  const {

    queue, nextUp, sound,

    setSongPlaying,

  } = useGlobalContext();

  const handlePress = async () => {
    try {
      const id = Math.floor(Math.random() * 40) + 1;
      const song = await getSongById(id);
      if (song) {
        // console.log(song);
        setSongPlaying(song);
      }
    }
    catch (error) {
      console.log('error: ', error);
    }
        

    // if (queue.length > 0) {
    //   console.log('skiping to first song up in queue');
    // }
    // else if (nextUp.length > 0) {
    //   console.log('skiping to first song up in next up');
    // }
    // else {
    //   console.log('no songs to skip to');
    // }
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={Local.container}
      onPress={handlePress}
    >
      <Shape size={size} />
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size}: {size: number}) => {

  const {

    history, sound

  } = useGlobalContext();

  const handlePress = async () => {
    const status = await sound?.getStatusAsync();
    console.log(status.positionMillis);
    if (status.positionMillis < 3000 && history.length > 0) {
      console.log('skiping to previous song');
    }
    else {
      console.log('resetting time');
      await jump(sound, 100);
    }
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[Local.flipped, Local.container]}
      onPress={handlePress}
    >
      <Shape size={size} />
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

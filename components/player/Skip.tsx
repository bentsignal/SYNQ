import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayButton } from './PausePlayButtons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { jump } from '@/lib/SoundManager';
import { getSongById, getNextUp } from '@/lib/SongManager';


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

  const { playNextSong } = useGlobalContext();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={Local.container}
      onPress={playNextSong}
    >
      <Shape size={size} />
    </TouchableOpacity>
  );
}

export const SkipLeft = ({size}: {size: number}) => {

  const {

    history, sound, songPlaying,
    nextUp,

    setSongPlaying, setNextUp, setHistory,
    setRewind, setPaused,

  } = useGlobalContext();

  const handlePress = async () => {
    try {
      const status = await sound?.getStatusAsync();
      if (status.positionMillis < 3000 && history.length > 0) {
        const current = songPlaying.id;
        const newHistory = history
        const newNextUp = nextUp;
        const id = newHistory.pop();
        if (id !== -1) {
          newNextUp.unshift(current);
          const newSong = await getSongById(id);
          setPaused(false);
          setSongPlaying(newSong);
          setNextUp(newNextUp);
          setHistory(newHistory);
        }
      }
      else {
        try {
          setRewind(true);
          await jump(sound, 100);
          setRewind(false);
        }
        catch (error) {
          setRewind(false);
        }
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

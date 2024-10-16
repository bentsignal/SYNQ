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

  const {

    queue, nextUp, sound,
    songPlaying, history,
    shuffle,

    setSongPlaying, setNextUp, setHistory,
    setQueue,

  } = useGlobalContext();

  const handlePress = async () => {

    try {
      if (queue.length > 0) {
        const newQueue = queue;
        const newHistory = history;
        const current = songPlaying.id;
        
        const newId = newQueue.shift();
        if (newId !== -1) {
          const newSong = await getSongById(newId);
          setSongPlaying(newSong);
          newHistory.push(current);
          setHistory(newHistory);
          setQueue(newQueue);
        }
      }
      else if (nextUp.length > 0) {
        console.log('skiping to first song up in next up');
        const current = songPlaying.id;
        const newNextUp = nextUp;
        const newHistory = history;
        const newId = newNextUp.shift();
        if (newId !== -1) {
          const newSong = await getSongById(newId);
          setSongPlaying(newSong);
          newHistory.push(current);
          setHistory(newHistory);
          setNextUp(newNextUp);
        }
      }
    }
    catch (error) {
      console.log('error skipping right: ', error);
    }

    // TODO: check if next up is getting close to empty, if so fetch more songs
    // if (nextUp.length < 10) {
    //   let newSongs = await getNextUp(songPlaying.id, 30, shuffle);
    //   if (newSongs.length < 1) {
    //     newSongs = await getNextUp(songPlaying.id, 30, true);
    //   }
    //   setNextUp([...nextUp, ...newSongs]);
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

    history, sound, songPlaying,
    nextUp,

    setSongPlaying, setNextUp, setHistory,
    setRewind,

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
          console.log('error rewinding: ', error);
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

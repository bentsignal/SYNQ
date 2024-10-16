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

  const fetchMoreSongs = async () => {
    try {
      let newSongs = await getNextUp(songPlaying.id, 30, shuffle);
      if (newSongs.length < 1) {
        newSongs = await getNextUp(songPlaying.id, 30, true);
      }
      return newSongs;
    }
    catch (error) {
      console.log('error fetching more songs: ', error);
      return [];
    }
  }

  const handlePress = async () => {

    try {
      // pull from queue if available
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
      // queue is empty, pull from next up
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
      // queue and next up are empty, fetch more songs
      else {
        try {
          const newNextUp = await fetchMoreSongs();
          const newId = newNextUp.shift();
          const newSong = await getSongById(newId);
          setSongPlaying(newSong);
          setNextUp(newNextUp);
        }
        catch (error) {
          console.log('ran out of songs and failed to fetch more: ', error);
        }
      }
    }
    catch (error) {
      console.log('error skipping right: ', error);
    }

    // next up is getting low, fetch more songs
    if (nextUp.length < 10) {
      const newSongs = await fetchMoreSongs();
      setNextUp([...nextUp, ...newSongs]);
    }

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

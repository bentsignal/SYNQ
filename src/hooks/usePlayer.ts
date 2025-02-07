import TrackPlayer, { Capability } from "react-native-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlaybackContext } from "../context/PlaybackProvider";
import { check } from "@/lib/Util";


export default function usePlayer () {

  const { setShuffle, setLoop, setSourceType, setSourceId } = usePlaybackContext();

  const setupPlayer = async () => {

    await TrackPlayer.setupPlayer();

    // restore shuffle
    const shuffle = await AsyncStorage.getItem('shuffle');
    if (check(shuffle)) {
      setShuffle(shuffle === 'true');
    }

    // restore loop
    const loop = await AsyncStorage.getItem('loop');
    if (check(loop)) {
      setLoop(loop === 'true');
    }

    // restore source type
    const sourceType = await AsyncStorage.getItem('sourceType');
    if (check(sourceType)) {
      setSourceType(Number(sourceType));
    }

    // restore source id
    const sourceId = await AsyncStorage.getItem('sourceId');
    if (check(sourceId)) {
      setSourceId(Number(sourceId));
    }
  
    // restore queue
    const queue = await AsyncStorage.getItem('queue');
    if (queue) {
      await TrackPlayer.setQueue(JSON.parse(queue));
    }
  
    // jump to track
    const lastTrackIndex = await AsyncStorage.getItem('lastTrackIndex');
    if (lastTrackIndex) {
      const index = Number(lastTrackIndex);
      await TrackPlayer.skip(index);
      if (index > 10) {
        await TrackPlayer.remove(Array.from({ length: index - 10 }, (_, i) => i + 1));
      }
    }

    // restore position
    const position = await AsyncStorage.getItem('position');
    if (position) {
      await TrackPlayer.seekTo(Number(position));
    }

    await TrackPlayer.pause();

    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Skip,
        Capability.Stop,
        Capability.SeekTo,
      ],
    });
    
  };

  return {
    setupPlayer,
  };

  
}
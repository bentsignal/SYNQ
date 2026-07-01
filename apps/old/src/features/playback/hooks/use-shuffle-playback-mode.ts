import { useCallback, useEffect, useState } from "react";
import {
  usePlaybackModeContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import usePlayer from "@/src/features/playback/hooks/use-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useActiveTrack } from "react-native-track-player";

export const useShufflePlaybackMode = () => {
  const { shuffle, setShuffle } = usePlaybackModeContext();
  const { sourceId, sourceType } = usePlaybackSourceContext();
  const { updateQueue } = usePlayer();
  const track = useActiveTrack();
  const [localShuffle, setLocalShuffle] = useState(shuffle);

  const toggleShuffle = useCallback(async () => {
    const previous = shuffle;
    try {
      const nextShuffle = !previous;
      setLocalShuffle(nextShuffle);
      setShuffle(nextShuffle);
      await AsyncStorage.setItem("shuffle", nextShuffle.toString());

      const id = track?.id;
      if (id && sourceType !== null && sourceId !== null) {
        await updateQueue(id, nextShuffle, sourceType, sourceId);
      }
    } catch {
      setShuffle(previous);
      setLocalShuffle(previous);
      await AsyncStorage.setItem("shuffle", previous.toString());
    }
  }, [setShuffle, shuffle, sourceId, sourceType, track?.id, updateQueue]);

  useEffect(() => {
    if (shuffle !== localShuffle) {
      setLocalShuffle(shuffle);
    }
  }, [localShuffle, shuffle]);

  return {
    shuffle: localShuffle,
    toggleShuffle,
  };
};

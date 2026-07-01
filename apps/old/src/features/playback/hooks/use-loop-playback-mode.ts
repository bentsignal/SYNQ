import { useCallback, useEffect, useState } from "react";
import { usePlaybackModeContext } from "@/src/features/playback/context/PlaybackProvider";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLoopPlaybackMode = () => {
  const { loop, setLoop } = usePlaybackModeContext();
  const [localLoop, setLocalLoop] = useState(loop);

  const toggleLoop = useCallback(async () => {
    const previous = loop;
    try {
      const nextLoop = !previous;
      setLocalLoop(nextLoop);
      setLoop(nextLoop);
      await AsyncStorage.setItem(playbackStorageKeys.loop, nextLoop.toString());
    } catch {
      setLoop(previous);
      setLocalLoop(previous);
      await AsyncStorage.setItem(playbackStorageKeys.loop, previous.toString());
    }
  }, [loop, setLoop]);

  useEffect(() => {
    setLocalLoop(loop);
  }, [loop]);

  return {
    loop: localLoop,
    toggleLoop,
  };
};

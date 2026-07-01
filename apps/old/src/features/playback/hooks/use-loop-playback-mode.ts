import { useCallback, useEffect, useState } from "react";
import { usePlaybackModeContext } from "@/src/features/playback/context/PlaybackProvider";
import { setPlaybackStorageBoolean } from "@/src/features/playback/lib/playback-storage-service";

export const useLoopPlaybackMode = () => {
  const { loop, setLoop } = usePlaybackModeContext();
  const [localLoop, setLocalLoop] = useState(loop);

  const toggleLoop = useCallback(async () => {
    const previous = loop;
    try {
      const nextLoop = !previous;
      setLocalLoop(nextLoop);
      setLoop(nextLoop);
      await setPlaybackStorageBoolean("loop", nextLoop);
    } catch {
      setLoop(previous);
      setLocalLoop(previous);
      await setPlaybackStorageBoolean("loop", previous);
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

import { useCallback, useEffect, useState } from "react";
import { usePlaybackModeContext } from "@/src/features/playback/context/PlaybackProvider";
import { applyLoopPlaybackMode } from "@/src/features/playback/lib/playback-mode-command-service";

export const useLoopPlaybackMode = () => {
  const { loop, setLoop } = usePlaybackModeContext();
  const [localLoop, setLocalLoop] = useState(loop);

  const toggleLoop = useCallback(async () => {
    const previous = loop;
    try {
      const nextLoop = !previous;
      setLocalLoop(nextLoop);
      setLoop(nextLoop);
      await applyLoopPlaybackMode(nextLoop);
    } catch {
      setLoop(previous);
      setLocalLoop(previous);
      await applyLoopPlaybackMode(previous);
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

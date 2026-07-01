import { useCallback, useEffect, useState } from "react";
import { usePlaybackModeContext } from "@/src/features/playback/context/PlaybackProvider";
import { commitLoopPlaybackModeChange } from "@/src/features/playback/lib/playback-mode-command-service";

export const useLoopPlaybackMode = () => {
  const { loop, setLoop } = usePlaybackModeContext();
  const [localLoop, setLocalLoop] = useState(loop);

  const toggleLoop = useCallback(async () => {
    const previous = loop;
    const nextLoop = !previous;
    setLocalLoop(nextLoop);
    setLoop(nextLoop);

    const committedLoop = await commitLoopPlaybackModeChange({
      nextLoop,
      previousLoop: previous,
    });

    setLoop(committedLoop);
    setLocalLoop(committedLoop);
  }, [loop, setLoop]);

  useEffect(() => {
    setLocalLoop(loop);
  }, [loop]);

  return {
    loop: localLoop,
    toggleLoop,
  };
};

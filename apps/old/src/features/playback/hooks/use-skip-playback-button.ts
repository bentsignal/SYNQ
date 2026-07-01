import { useCallback } from "react";

import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import usePlayer from "@/src/features/playback/hooks/use-player";

type SkipPlaybackDirection = "left" | "right";

export const useSkipPlaybackButton = (direction: SkipPlaybackDirection) => {
  const { skipLeft, skipRight } = usePlayer();
  const { sendHaptic } = useHaptics();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();

  const skip = useCallback(async () => {
    await runAdGatedPlaybackCommand({
      command: async () => {
        sendHaptic("light");

        if (direction === "left") {
          await skipLeft();
          return;
        }

        await skipRight();
      },
    });
  }, [direction, runAdGatedPlaybackCommand, sendHaptic, skipLeft, skipRight]);

  return {
    skip,
  };
};

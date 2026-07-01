import { useCallback } from "react";

import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import {
  usePlaybackAddOffsetContext,
  usePlaybackModeContext,
  usePlaybackQueueFilterContext,
  usePlaybackQueueRefreshContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { useAdGatedPlaybackCommand } from "@/src/features/playback/hooks/use-ad-gated-playback-command";
import {
  skipToNextPlayableTrack,
  skipToPreviousPlayableTrack,
} from "@/src/features/playback/lib/playback-queue-navigation-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";

type SkipPlaybackDirection = "left" | "right";

export const useSkipPlaybackButton = (direction: SkipPlaybackDirection) => {
  const { sendHaptic } = useHaptics();
  const { theme } = useThemeContext();
  const { runAdGatedPlaybackCommand } = useAdGatedPlaybackCommand();
  const { loop, shuffle } = usePlaybackModeContext();
  const { sourceId, sourceType } = usePlaybackSourceContext();
  const { order, query, sort } = usePlaybackQueueFilterContext();
  const { requestQueueRefresh } = usePlaybackQueueRefreshContext();
  const { addOffset, decrementAddOffset, incrementAddOffset, resetAddOffset } =
    usePlaybackAddOffsetContext();

  const skip = useCallback(async () => {
    await runAdGatedPlaybackCommand({
      command: async () => {
        sendHaptic("light");

        if (direction === "left") {
          await skipToPreviousPlayableTrack({
            addOffset,
            incrementAddOffset,
          });
          return;
        }

        await skipToNextPlayableTrack({
          loop,
          sourceType,
          sourceId,
          shuffle,
          sort,
          order,
          query,
          theme,
          sendPlaybackError: sendHaptic,
          decrementAddOffset,
          requestQueueRefresh,
          resetAddOffset,
        });
      },
    });
  }, [
    addOffset,
    decrementAddOffset,
    direction,
    incrementAddOffset,
    loop,
    order,
    query,
    requestQueueRefresh,
    resetAddOffset,
    runAdGatedPlaybackCommand,
    sendHaptic,
    shuffle,
    sort,
    sourceId,
    sourceType,
    theme,
  ]);

  return {
    skip,
  };
};

import { useCallback, useEffect, useState } from "react";
import {
  usePlaybackAddOffsetContext,
  usePlaybackModeContext,
  usePlaybackQueueRefreshContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { setPlaybackStorageBoolean } from "@/src/features/playback/lib/playback-storage-service";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import { useActiveTrack } from "react-native-track-player";

export const useShufflePlaybackMode = () => {
  const { shuffle, setShuffle } = usePlaybackModeContext();
  const { sourceId, sourceType } = usePlaybackSourceContext();
  const { requestQueueRefresh } = usePlaybackQueueRefreshContext();
  const { resetAddOffset } = usePlaybackAddOffsetContext();
  const { theme } = useThemeContext();
  const track = useActiveTrack();
  const [localShuffle, setLocalShuffle] = useState(shuffle);

  const toggleShuffle = useCallback(async () => {
    const previous = shuffle;
    try {
      const nextShuffle = !previous;
      setLocalShuffle(nextShuffle);
      setShuffle(nextShuffle);
      await setPlaybackStorageBoolean("shuffle", nextShuffle);

      const id = track?.id;
      if (id && sourceType !== null && sourceId !== null) {
        await updateUpcomingQueue({
          currentId: id,
          shuffleValue: nextShuffle,
          sourceTypeValue: sourceType,
          sourceIdValue: sourceId,
          theme,
          requestQueueRefresh,
          resetAddOffset,
        });
      }
    } catch {
      setShuffle(previous);
      setLocalShuffle(previous);
      await setPlaybackStorageBoolean("shuffle", previous);
    }
  }, [
    requestQueueRefresh,
    resetAddOffset,
    setShuffle,
    shuffle,
    sourceId,
    sourceType,
    theme,
    track?.id,
  ]);

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

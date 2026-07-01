import { useCallback, useEffect, useState } from "react";
import {
  usePlaybackAddOffsetContext,
  usePlaybackModeContext,
  usePlaybackQueueRefreshContext,
  usePlaybackSourceContext,
} from "@/src/features/playback/context/PlaybackProvider";
import { commitShufflePlaybackModeChange } from "@/src/features/playback/lib/playback-mode-command-service";
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
    const nextShuffle = !previous;
    setLocalShuffle(nextShuffle);
    setShuffle(nextShuffle);

    const committedShuffle = await commitShufflePlaybackModeChange({
      currentId: track?.id,
      nextShuffle,
      previousShuffle: previous,
      sourceId,
      sourceType,
      theme,
      requestQueueRefresh,
      resetAddOffset,
    });

    setShuffle(committedShuffle);
    setLocalShuffle(committedShuffle);
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

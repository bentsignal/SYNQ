import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import {
  addTrackToQueue,
  skipToNextPlayableTrack,
  skipToPreviousPlayableTrack,
  updateUpcomingQueue,
} from "@/src/features/playback/lib/player-queue-actions-service";
import { setupPlayer as setupTrackPlayer } from "@/src/features/playback/lib/player-setup-service";
import { useHaptics } from "@/src/hooks/use-haptics";
import { Track } from "react-native-track-player";

export default function usePlayer() {
  const {
    setShuffle,
    setLoop,
    setSourceType,
    setSourceId,
    addOffset,
    setAddOffset,
    sourceType,
    sourceId,
    shuffle,
    loop,
    incrementAddOffset,
    decrementAddOffset,
    resetAddOffset,
    sort,
    order,
    query,
    requestQueueRefresh,
  } = usePlaybackContext();

  const { theme } = useThemeContext();
  const { sendHaptic } = useHaptics();

  const setupPlayer = async () => {
    await setupTrackPlayer({
      setShuffle,
      setLoop,
      setSourceType,
      setSourceId,
      setAddOffset,
    });
  };

  const addToQueue = async (track: Track) => {
    await addTrackToQueue({
      track,
      addOffset,
      incrementAddOffset,
    });
  };

  const skipRight = async () => {
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
  };

  const skipLeft = async () => {
    await skipToPreviousPlayableTrack({
      addOffset,
      incrementAddOffset,
    });
  };

  const updateQueue = async (
    currentId: number,
    shuffleValue: boolean,
    sourceTypeValue: SourceType,
    sourceIdValue: number,
    sort?: SortType,
    order?: SortOrder,
    query?: string,
  ) => {
    await updateUpcomingQueue({
      currentId,
      shuffleValue,
      sourceTypeValue,
      sourceIdValue,
      sort,
      order,
      query,
      theme,
      requestQueueRefresh,
      resetAddOffset,
    });
  };

  return {
    setupPlayer,
    addToQueue,
    skipRight,
    skipLeft,
    updateQueue,
  };
}

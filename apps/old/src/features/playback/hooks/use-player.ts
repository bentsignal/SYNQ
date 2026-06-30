import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useThemeContext } from "@/src/context/ThemeProvider";
import { usePlaybackContext } from "@/src/features/playback/context/PlaybackProvider";
import {
  addTrackToQueue,
  moveQueueTrack,
  pausePlayback,
  playPlayback,
  playTrackNow,
  removeTracksBySongIds,
  resetPlaybackQueue,
  seekToPlaybackPosition,
  skipToNextPlayableTrack,
  skipToPreviousPlayableTrack,
  togglePlaybackState,
  updateUpcomingQueue,
} from "@/src/features/playback/lib/player-queue-actions-service";
import { setupPlayer as setupTrackPlayer } from "@/src/features/playback/lib/player-setup-service";
import { getTrackFromSong } from "@/src/features/playback/lib/track-factory";
import { useHaptics } from "@/src/hooks/use-haptics";
import { State, Track } from "react-native-track-player";

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

  const addSongToQueue = async (song: SongType) => {
    const newTrack = await getTrackFromSong(song, theme);
    if (newTrack) {
      await addToQueue(newTrack);
    }
  };

  const moveQueueSong = async (from: number, to: number) => {
    await moveQueueTrack(from, to);
  };

  const removeSongsFromQueue = async (songIds: number[]) => {
    await removeTracksBySongIds(songIds);
  };

  const resetPlayer = async () => {
    await resetPlaybackQueue();
  };

  const playPlayer = async () => {
    await playPlayback();
  };

  const pausePlayer = async () => {
    await pausePlayback();
  };

  const seekToPosition = async (position: number) => {
    await seekToPlaybackPosition(position);
  };

  const togglePlayback = async (currentState: State) => {
    await togglePlaybackState(currentState);
  };

  const playSong = async (song: SongType) => {
    const newTrack = await getTrackFromSong(song, theme);
    if (!newTrack) {
      return false;
    }

    await playTrackNow(newTrack);
    return true;
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
    addSongToQueue,
    moveQueueSong,
    pausePlayer,
    playPlayer,
    playSong,
    removeSongsFromQueue,
    resetPlayer,
    seekToPosition,
    skipRight,
    skipLeft,
    togglePlayback,
    updateQueue,
  };
}

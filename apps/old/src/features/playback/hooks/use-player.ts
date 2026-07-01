import {
  SongType,
  SortOrder,
  SortType,
  SourceType,
} from "@/src/constants/Types";
import { useThemeContext } from "@/src/features/theme/context/ThemeProvider";
import {
  usePlaybackAddOffsetContext,
  usePlaybackQueueRefreshContext,
} from "@/src/features/playback/context/PlaybackProvider";
import {
  removeTracksBySongIds,
  resetPlaybackQueue,
} from "@/src/features/playback/lib/player-queue-actions-service";
import {
  addSongToPlaybackQueue,
  playSongNow,
} from "@/src/features/playback/lib/playback-song-command-service";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";
import {
  pausePlayback,
  playPlayback,
  seekToPlaybackPosition,
  togglePlaybackState,
} from "@/src/features/playback/lib/playback-transport-service";
import { State } from "react-native-track-player";

export default function usePlayer() {
  const { addOffset, incrementAddOffset, resetAddOffset } =
    usePlaybackAddOffsetContext();
  const { requestQueueRefresh } = usePlaybackQueueRefreshContext();

  const { theme } = useThemeContext();

  const addSongToQueue = async (song: SongType) => {
    await addSongToPlaybackQueue({
      song,
      theme,
      addOffset,
      incrementAddOffset,
    });
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
    return playSongNow({ song, theme });
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
    addSongToQueue,
    pausePlayer,
    playPlayer,
    playSong,
    removeSongsFromQueue,
    resetPlayer,
    seekToPosition,
    togglePlayback,
    updateQueue,
  };
}

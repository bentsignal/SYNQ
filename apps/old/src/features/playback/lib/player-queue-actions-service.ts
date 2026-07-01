import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { getNextUp } from "@/src/features/playback/lib/playback-queue-service";
import { getTrackFromSong } from "@/src/features/playback/lib/track-factory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer, { State, Track } from "react-native-track-player";

type SendPlaybackError = (type: "error") => void;

type QueueRefreshActions = {
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
};

type UpdateQueueArgs = QueueRefreshActions & {
  currentId: number;
  shuffleValue: boolean;
  sourceTypeValue: SourceType;
  sourceIdValue: number;
  theme: string;
  sort?: SortType;
  order?: SortOrder;
  query?: string;
};

export const persistPlaybackQueue = async () => {
  const queue = await TrackPlayer.getQueue();
  await AsyncStorage.setItem("queue", JSON.stringify(queue));
};

export const addTrackToQueue = async ({
  track,
  addOffset,
  incrementAddOffset,
}: {
  track: Track;
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
}) => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentIndex !== undefined) {
    await TrackPlayer.add(track, currentIndex + addOffset + 1);
    await incrementAddOffset();
  }
  await persistPlaybackQueue();
};

export const moveQueueTrack = async (from: number, to: number) => {
  await TrackPlayer.move(from, to);
};

export const getActiveQueueTrackIndex = async () => {
  return TrackPlayer.getActiveTrackIndex();
};

export const getPlaybackQueue = async () => {
  return TrackPlayer.getQueue();
};

export const playTrackNow = async (track: Track): Promise<void> => {
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  const queue = await TrackPlayer.getQueue();
  if (currentIndex === queue.length - 1) {
    await TrackPlayer.add(track);
    await TrackPlayer.skipToNext();
  } else if (currentIndex === undefined) {
    await TrackPlayer.add(track);
  } else {
    await TrackPlayer.add(track, currentIndex + 1);
    await TrackPlayer.skipToNext();
  }
  await TrackPlayer.play();
};

export const removeTracksBySongIds = async (songIds: number[]) => {
  const idsToRemove = new Set(songIds);
  const queue = await TrackPlayer.getQueue();
  const indicesToRemove = queue
    .map((track: Track, index: number) =>
      idsToRemove.has(Number(track.id)) ? index : -1,
    )
    .filter((index) => index !== -1);

  await TrackPlayer.remove(indicesToRemove);
};

export const resetPlaybackQueue = async () => {
  await TrackPlayer.reset();
};

export const playPlayback = async () => {
  await TrackPlayer.play();
};

export const pausePlayback = async () => {
  await TrackPlayer.pause();
};

export const skipToNextQueueTrack = async () => {
  await TrackPlayer.skipToNext();
};

export const seekToPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position);
};

export const togglePlaybackState = async (currentState: State) => {
  if ([State.Paused, State.Ready].includes(currentState)) {
    await TrackPlayer.play();
  } else {
    await TrackPlayer.pause();
  }
};

export const skipToNextPlayableTrack = async ({
  loop,
  sourceType,
  sourceId,
  shuffle,
  sort,
  order,
  query,
  theme,
  sendPlaybackError,
  decrementAddOffset,
  requestQueueRefresh,
  resetAddOffset,
}: QueueRefreshActions & {
  loop: boolean;
  sourceType: SourceType | null;
  sourceId: number | null;
  shuffle: boolean;
  sort: SortType;
  order: SortOrder;
  query: string;
  theme: string;
  sendPlaybackError: SendPlaybackError;
  decrementAddOffset: () => Promise<void>;
}) => {
  try {
    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentIndex === undefined) {
      sendPlaybackError("error");
      return;
    }

    if (currentIndex >= queue.length - 1 && !loop) {
      // no next song
      sendPlaybackError("error");
    } else {
      // if loop is on, keep queue going infinitely
      if (currentIndex >= queue.length - 1 && loop) {
        if (sourceType === null || sourceId === null) {
          sendPlaybackError("error");
          return;
        }

        await updateUpcomingQueue({
          currentId: queue[currentIndex].id,
          shuffleValue: shuffle,
          sourceTypeValue: sourceType,
          sourceIdValue: sourceId,
          sort,
          order,
          query,
          theme,
          requestQueueRefresh,
          resetAddOffset,
        });
      }
      let nextIndex = currentIndex + 1;
      let nextTrack = await TrackPlayer.getTrack(nextIndex);
      while (nextTrack?.id === -1 && nextIndex < queue.length) {
        nextIndex++;
        nextTrack = await TrackPlayer.getTrack(nextIndex);
      }
      await TrackPlayer.skip(nextIndex);
      await TrackPlayer.play();
    }
    await decrementAddOffset();
  } catch (error) {
    console.log("error skipping right: ", error);
  }
};

export const skipToPreviousPlayableTrack = async ({
  addOffset,
  incrementAddOffset,
}: {
  addOffset: number;
  incrementAddOffset: () => Promise<void>;
}) => {
  try {
    const progress = await TrackPlayer.getProgress();
    const index = await TrackPlayer.getActiveTrackIndex();
    if (progress.position < 3 && index !== 0 && index !== undefined) {
      let nextIndex = index - 1;
      let nextTrack = await TrackPlayer.getTrack(nextIndex);
      while (nextTrack?.id === -1 && nextIndex >= 0) {
        nextIndex--;
        nextTrack = await TrackPlayer.getTrack(nextIndex);
      }
      await TrackPlayer.skip(nextIndex);
      await TrackPlayer.play();
      if (addOffset > 0) await incrementAddOffset();
    } else {
      await TrackPlayer.seekTo(0);
    }
  } catch (error) {
    console.log("error skipping left: ", error);
  }
};

export const updateUpcomingQueue = async ({
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
}: UpdateQueueArgs) => {
  await TrackPlayer.removeUpcomingTracks();
  const upcoming = await getNextUp(
    currentId,
    100,
    shuffleValue,
    sourceTypeValue,
    sourceIdValue,
    sort,
    order,
    query,
  );
  let upcomingTracks: Track[] = [];
  for (let i = 0; i < upcoming.length; i++) {
    const newTrack = await getTrackFromSong(upcoming[i], theme);
    if (newTrack) {
      upcomingTracks.push(newTrack);
    }
  }
  await TrackPlayer.add(upcomingTracks);
  requestQueueRefresh();
  await persistPlaybackQueue();
  await resetAddOffset();
};

import { SortOrder, SortType, SourceType } from "@/src/constants/Types";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";
import TrackPlayer from "react-native-track-player";

type SendPlaybackError = (type: "error") => void;

type QueueRefreshActions = {
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
};

const getNextPlayableQueueIndex = async (
  startIndex: number,
  queueLength: number,
) => {
  let nextIndex = startIndex;
  let nextTrack = await TrackPlayer.getTrack(nextIndex);

  while (nextTrack?.id === -1 && nextIndex < queueLength) {
    nextIndex++;
    nextTrack = await TrackPlayer.getTrack(nextIndex);
  }

  return nextIndex;
};

const getPreviousPlayableQueueIndex = async (startIndex: number) => {
  let nextIndex = startIndex;
  let nextTrack = await TrackPlayer.getTrack(nextIndex);

  while (nextTrack?.id === -1 && nextIndex >= 0) {
    nextIndex--;
    nextTrack = await TrackPlayer.getTrack(nextIndex);
  }

  return nextIndex;
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
      sendPlaybackError("error");
    } else {
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
      const nextIndex = await getNextPlayableQueueIndex(
        currentIndex + 1,
        queue.length,
      );
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
      const nextIndex = await getPreviousPlayableQueueIndex(index - 1);
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

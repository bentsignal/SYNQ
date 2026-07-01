import { SourceType } from "@/src/constants/Types";
import { setPlaybackStorageBoolean } from "@/src/features/playback/lib/playback-storage-service";
import { updateUpcomingQueue } from "@/src/features/playback/lib/playback-upcoming-queue-service";

type QueueRefreshActions = {
  requestQueueRefresh: () => void;
  resetAddOffset: () => Promise<void>;
};

type ApplyShufflePlaybackModeArgs = QueueRefreshActions & {
  currentId?: number | string;
  nextShuffle: boolean;
  rebuildUpcomingQueue?: boolean;
  sourceId: number | null;
  sourceType: SourceType | null;
  theme: string;
};

type CommitLoopPlaybackModeChangeArgs = {
  nextLoop: boolean;
  previousLoop: boolean;
};

type CommitShufflePlaybackModeChangeArgs = QueueRefreshActions & {
  currentId?: number | string;
  nextShuffle: boolean;
  previousShuffle: boolean;
  sourceId: number | null;
  sourceType: SourceType | null;
  theme: string;
};

export const applyLoopPlaybackMode = (nextLoop: boolean) => {
  return setPlaybackStorageBoolean("loop", nextLoop);
};

export const applyShufflePlaybackMode = async ({
  currentId,
  nextShuffle,
  rebuildUpcomingQueue = true,
  sourceId,
  sourceType,
  theme,
  requestQueueRefresh,
  resetAddOffset,
}: ApplyShufflePlaybackModeArgs) => {
  await setPlaybackStorageBoolean("shuffle", nextShuffle);

  if (
    rebuildUpcomingQueue &&
    currentId &&
    sourceType !== null &&
    sourceId !== null
  ) {
    await updateUpcomingQueue({
      currentId: Number(currentId),
      shuffleValue: nextShuffle,
      sourceTypeValue: sourceType,
      sourceIdValue: sourceId,
      theme,
      requestQueueRefresh,
      resetAddOffset,
    });
  }
};

export const commitLoopPlaybackModeChange = async ({
  nextLoop,
  previousLoop,
}: CommitLoopPlaybackModeChangeArgs) => {
  try {
    await applyLoopPlaybackMode(nextLoop);

    return nextLoop;
  } catch {
    try {
      await applyLoopPlaybackMode(previousLoop);
    } catch {
      // The UI should still return to the last known state if persistence fails.
    }

    return previousLoop;
  }
};

export const commitShufflePlaybackModeChange = async ({
  currentId,
  nextShuffle,
  previousShuffle,
  sourceId,
  sourceType,
  theme,
  requestQueueRefresh,
  resetAddOffset,
}: CommitShufflePlaybackModeChangeArgs) => {
  try {
    await applyShufflePlaybackMode({
      currentId,
      nextShuffle,
      sourceId,
      sourceType,
      theme,
      requestQueueRefresh,
      resetAddOffset,
    });

    return nextShuffle;
  } catch {
    try {
      await applyShufflePlaybackMode({
        currentId,
        nextShuffle: previousShuffle,
        rebuildUpcomingQueue: false,
        sourceId,
        sourceType,
        theme,
        requestQueueRefresh,
        resetAddOffset,
      });
    } catch {
      // The UI should still return to the last known state if persistence fails.
    }

    return previousShuffle;
  }
};

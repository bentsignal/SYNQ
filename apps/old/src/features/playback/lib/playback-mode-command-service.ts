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

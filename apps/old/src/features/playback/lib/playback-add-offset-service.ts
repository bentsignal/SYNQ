import { getActiveQueueTrackIndex } from "@/src/features/playback/lib/playback-queue-read-service";
import { setPlaybackStorageNumber } from "@/src/features/playback/lib/playback-storage-service";

type ReconcileAddOffsetArgs = {
  addOffset: number;
  decrementAddOffset: () => Promise<void>;
  previousIndex: number;
};

export const getIncrementedAddOffset = (addOffset: number) => addOffset + 1;

export const getDecrementedAddOffset = (addOffset: number) => {
  if (addOffset <= 0) {
    return addOffset;
  }

  return addOffset - 1;
};

export const persistPlaybackAddOffset = (addOffset: number) => {
  return setPlaybackStorageNumber("addOffset", addOffset);
};

export const getCurrentActiveQueueIndex = () => {
  return getActiveQueueTrackIndex();
};

export const reconcileAddOffsetAfterActiveIndexChange = async ({
  addOffset,
  decrementAddOffset,
  previousIndex,
}: ReconcileAddOffsetArgs) => {
  const activeIndex = await getCurrentActiveQueueIndex();
  if (activeIndex === undefined) {
    return undefined;
  }

  if (activeIndex !== previousIndex) {
    if (activeIndex - previousIndex === 1 && addOffset > 0) {
      await decrementAddOffset();
    }

    return activeIndex;
  }

  return previousIndex;
};

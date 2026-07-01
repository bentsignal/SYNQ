import { getActiveQueueTrackIndex } from "@/src/features/playback/lib/playback-queue-read-service";
import { setPlaybackStorageNumber } from "@/src/features/playback/lib/playback-storage-service";

export const persistPlaybackPosition = (position: number) => {
  return setPlaybackStorageNumber("position", position);
};

export const persistActiveQueueTrackIndex = async () => {
  const activeIndex = await getActiveQueueTrackIndex();
  if (activeIndex === undefined) {
    return;
  }

  await setPlaybackStorageNumber("lastTrackIndex", activeIndex);
};

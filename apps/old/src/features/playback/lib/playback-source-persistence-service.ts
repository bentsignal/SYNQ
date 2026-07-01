import { SourceType } from "@/src/constants/Types";
import { setPlaybackStorageNumber } from "@/src/features/playback/lib/playback-storage-service";

type PlaybackSource = {
  id: number;
  type: SourceType;
};

export const persistPlaybackSourceStorage = async ({
  id,
  type,
}: PlaybackSource) => {
  await setPlaybackStorageNumber("sourceType", type);
  await setPlaybackStorageNumber("sourceId", id);
};

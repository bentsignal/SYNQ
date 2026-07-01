import { setPlaybackStorageQueue } from "@/src/features/playback/lib/playback-storage-service";
import TrackPlayer from "react-native-track-player";

export const persistPlaybackQueue = async () => {
  const queue = await TrackPlayer.getQueue();
  await setPlaybackStorageQueue(queue);
};

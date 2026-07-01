import { SourceType } from "@/src/constants/Types";
import {
  getPlaybackStorageBoolean,
  getPlaybackStorageItem,
  getPlaybackStorageNumber,
} from "@/src/features/playback/lib/playback-storage-service";
import TrackPlayer, { Capability } from "react-native-track-player";

type RestorePlaybackStateActions = {
  setShuffle: (newValue: boolean) => void;
  setLoop: (newValue: boolean) => void;
  setSourceType: (newValue: SourceType | null) => void;
  setSourceId: (newValue: number | null) => void;
  setAddOffset: (newValue: number) => void;
};

export const setupPlayer = async ({
  setShuffle,
  setLoop,
  setSourceType,
  setSourceId,
  setAddOffset,
}: RestorePlaybackStateActions) => {
  await TrackPlayer.setupPlayer();

  // restore shuffle
  const shuffle = await getPlaybackStorageBoolean("shuffle");
  if (shuffle !== null) {
    setShuffle(shuffle);
  }

  // restore loop
  const loop = await getPlaybackStorageBoolean("loop");
  if (loop !== null) {
    setLoop(loop);
  }

  // restore source type
  const sourceType = await getPlaybackStorageNumber("sourceType");
  if (sourceType !== null) {
    setSourceType(sourceType as SourceType);
  }

  // restore source id
  const sourceId = await getPlaybackStorageNumber("sourceId");
  if (sourceId !== null) {
    setSourceId(sourceId);
  }

  // restore queue
  const queue = await getPlaybackStorageItem("queue");
  if (queue) {
    await TrackPlayer.setQueue(JSON.parse(queue));
  }

  // jump to track
  const lastTrackIndex = await getPlaybackStorageNumber("lastTrackIndex");
  if (lastTrackIndex !== null) {
    await TrackPlayer.skip(lastTrackIndex);
    if (lastTrackIndex > 10) {
      await TrackPlayer.remove(
        Array.from({ length: lastTrackIndex - 10 }, (_, i) => i + 1),
      );
    }
  }

  // restore position
  const position = await getPlaybackStorageNumber("position");
  if (position !== null) {
    await TrackPlayer.seekTo(position);
  }

  // restore add offset
  const addOffset = await getPlaybackStorageNumber("addOffset");
  if (addOffset !== null) {
    setAddOffset(addOffset);
  }

  await TrackPlayer.pause();

  TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Skip,
      Capability.Stop,
      Capability.SeekTo,
    ],
  });
};

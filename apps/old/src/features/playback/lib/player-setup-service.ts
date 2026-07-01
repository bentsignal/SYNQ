import { SourceType } from "@/src/constants/Types";
import { getPlaybackStorageItem } from "@/src/features/playback/lib/playback-storage-service";
import { check } from "@/src/lib/util";
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
  const shuffle = await getPlaybackStorageItem("shuffle");
  if (check(shuffle)) {
    setShuffle(shuffle === "true");
  }

  // restore loop
  const loop = await getPlaybackStorageItem("loop");
  if (check(loop)) {
    setLoop(loop === "true");
  }

  // restore source type
  const sourceType = await getPlaybackStorageItem("sourceType");
  if (check(sourceType)) {
    setSourceType(Number(sourceType));
  }

  // restore source id
  const sourceId = await getPlaybackStorageItem("sourceId");
  if (check(sourceId)) {
    setSourceId(Number(sourceId));
  }

  // restore queue
  const queue = await getPlaybackStorageItem("queue");
  if (queue) {
    await TrackPlayer.setQueue(JSON.parse(queue));
  }

  // jump to track
  const lastTrackIndex = await getPlaybackStorageItem("lastTrackIndex");
  if (lastTrackIndex) {
    const index = Number(lastTrackIndex);
    await TrackPlayer.skip(index);
    if (index > 10) {
      await TrackPlayer.remove(
        Array.from({ length: index - 10 }, (_, i) => i + 1),
      );
    }
  }

  // restore position
  const position = await getPlaybackStorageItem("position");
  if (position) {
    await TrackPlayer.seekTo(Number(position));
  }

  // restore add offset
  const addOffset = await getPlaybackStorageItem("addOffset");
  if (addOffset) {
    setAddOffset(Number(addOffset));
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

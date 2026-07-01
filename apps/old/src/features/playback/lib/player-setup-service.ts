import { SourceType } from "@/src/constants/Types";
import { playbackStorageKeys } from "@/src/features/playback/lib/playback-storage-keys";
import { check } from "@/src/lib/util";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const shuffle = await AsyncStorage.getItem(playbackStorageKeys.shuffle);
  if (check(shuffle)) {
    setShuffle(shuffle === "true");
  }

  // restore loop
  const loop = await AsyncStorage.getItem(playbackStorageKeys.loop);
  if (check(loop)) {
    setLoop(loop === "true");
  }

  // restore source type
  const sourceType = await AsyncStorage.getItem(playbackStorageKeys.sourceType);
  if (check(sourceType)) {
    setSourceType(Number(sourceType));
  }

  // restore source id
  const sourceId = await AsyncStorage.getItem(playbackStorageKeys.sourceId);
  if (check(sourceId)) {
    setSourceId(Number(sourceId));
  }

  // restore queue
  const queue = await AsyncStorage.getItem(playbackStorageKeys.queue);
  if (queue) {
    await TrackPlayer.setQueue(JSON.parse(queue));
  }

  // jump to track
  const lastTrackIndex = await AsyncStorage.getItem(
    playbackStorageKeys.lastTrackIndex,
  );
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
  const position = await AsyncStorage.getItem(playbackStorageKeys.position);
  if (position) {
    await TrackPlayer.seekTo(Number(position));
  }

  // restore add offset
  const addOffset = await AsyncStorage.getItem(playbackStorageKeys.addOffset);
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

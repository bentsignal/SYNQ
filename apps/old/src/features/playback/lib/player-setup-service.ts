import { SourceType } from "@/src/constants/Types";
import { getPersistedPlaybackState } from "@/src/features/playback/lib/playback-storage-service";
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
  const persistedState = await getPersistedPlaybackState();

  // restore shuffle
  if (persistedState.shuffle !== null) {
    setShuffle(persistedState.shuffle);
  }

  // restore loop
  if (persistedState.loop !== null) {
    setLoop(persistedState.loop);
  }

  // restore source type
  if (persistedState.sourceType !== null) {
    setSourceType(persistedState.sourceType);
  }

  // restore source id
  if (persistedState.sourceId !== null) {
    setSourceId(persistedState.sourceId);
  }

  // restore queue
  if (persistedState.queue) {
    await TrackPlayer.setQueue(persistedState.queue);
  }

  // jump to track
  if (persistedState.lastTrackIndex !== null) {
    await TrackPlayer.skip(persistedState.lastTrackIndex);
    if (persistedState.lastTrackIndex > 10) {
      await TrackPlayer.remove(
        Array.from(
          { length: persistedState.lastTrackIndex - 10 },
          (_, i) => i + 1,
        ),
      );
    }
  }

  // restore position
  if (persistedState.position !== null) {
    await TrackPlayer.seekTo(persistedState.position);
  }

  // restore add offset
  if (persistedState.addOffset !== null) {
    setAddOffset(persistedState.addOffset);
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

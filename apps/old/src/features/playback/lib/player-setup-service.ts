import { SourceType } from "@/src/constants/Types";
import { getPersistedPlaybackState } from "@/src/features/playback/lib/playback-storage-service";
import TrackPlayer, { Capability } from "react-native-track-player";

type PersistedPlaybackState = Awaited<
  ReturnType<typeof getPersistedPlaybackState>
>;

type RestorePlaybackStateActions = {
  setShuffle: (newValue: boolean) => void;
  setLoop: (newValue: boolean) => void;
  setSourceType: (newValue: SourceType | null) => void;
  setSourceId: (newValue: number | null) => void;
  setAddOffset: (newValue: number) => void;
};

const applyPersistedPlaybackState = (
  persistedState: PersistedPlaybackState,
  {
    setShuffle,
    setLoop,
    setSourceType,
    setSourceId,
    setAddOffset,
  }: RestorePlaybackStateActions,
) => {
  if (persistedState.shuffle !== null) {
    setShuffle(persistedState.shuffle);
  }

  if (persistedState.loop !== null) {
    setLoop(persistedState.loop);
  }

  if (persistedState.sourceType !== null) {
    setSourceType(persistedState.sourceType);
  }

  if (persistedState.sourceId !== null) {
    setSourceId(persistedState.sourceId);
  }

  if (persistedState.addOffset !== null) {
    setAddOffset(persistedState.addOffset);
  }
};

const restoreTrackPlayerQueue = async (
  persistedState: PersistedPlaybackState,
) => {
  if (persistedState.queue) {
    await TrackPlayer.setQueue(persistedState.queue);
  }

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

  if (persistedState.position !== null) {
    await TrackPlayer.seekTo(persistedState.position);
  }
};

const configureTrackPlayerOptions = () => {
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

export const setupPlayer = async (actions: RestorePlaybackStateActions) => {
  await TrackPlayer.setupPlayer();
  const persistedState = await getPersistedPlaybackState();

  applyPersistedPlaybackState(persistedState, actions);
  await restoreTrackPlayerQueue(persistedState);
  await TrackPlayer.pause();
  configureTrackPlayerOptions();
};

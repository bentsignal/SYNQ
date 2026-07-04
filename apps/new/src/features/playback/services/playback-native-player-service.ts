import type { PlaybackQueueItem } from "../types/playback-state";
import { createPlaybackNativePlayerSources } from "./playback-native-player-source-service";
import {
  initialPlaybackNativePlayerRegistryState,
} from "./playback-native-player-state-service";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

export const createPlaybackNativePlayerRegistry = () => {
  let registryState = initialPlaybackNativePlayerRegistryState();
  const sources = createPlaybackNativePlayerSources({
    getRegistryState: () => registryState,
    setRegistryState: (nextState) => {
      registryState = nextState;
    },
  });

  return {
    destroy: async () => sources.stop(),
    pause: async () => sources.pauseActive(),
    playAd: () => sources.playAd(),
    playLibrarySong: (song: PlaybackQueueItem) => sources.playLibrarySong(song),
    resume: async () => sources.resumeActive(),
    resumeLibrary: async () => sources.resumeLibrary(),
    seekLibraryTo: (position: number) => sources.seekLibraryTo(position),
    setStatusListener: (listener: TrackPlayerStatusListener | null) =>
      sources.setStatusListener(listener),
    stop: async () => sources.stop(),
  };
};

import type { AudioPlayer, AudioStatus } from "expo-audio";
import {
  audioStatusToTrackPlayerSnapshot,
  type TrackPlayerSource,
} from "./playback-native-status-service";
import type {
  TrackPlayerStatusListener,
} from "./playback-native-player-source-types-service";

type AudioPlayerSubscription = { remove: () => void };
type PlaybackStatusPlayer = AudioPlayer & {
  addListener: (
    event: "playbackStatusUpdate",
    listener: (status: AudioStatus) => void,
  ) => { remove: () => void };
};

export const createTrackPlayerStatusListenerRegistry = ({
  getLoadedSongId,
}: {
  getLoadedSongId: () => number | null;
}) => {
  let adStatusSubscription: AudioPlayerSubscription | null = null;
  let libraryStatusSubscription: AudioPlayerSubscription | null = null;
  let statusListener: TrackPlayerStatusListener | null = null;

  const attach = (
    player: AudioPlayer | null,
    source: TrackPlayerSource,
  ) => {
    const subscription = (player as PlaybackStatusPlayer | null)?.addListener(
      "playbackStatusUpdate",
      (status) => {
        statusListener?.(
          audioStatusToTrackPlayerSnapshot({
            loadedSongId: getLoadedSongId(),
            source,
            status,
          }),
        );
      },
    );

    if (source === "ad") {
      adStatusSubscription?.remove();
      adStatusSubscription = subscription ?? null;
      return;
    }

    libraryStatusSubscription?.remove();
    libraryStatusSubscription = subscription ?? null;
  };

  const removeAd = () => {
    adStatusSubscription?.remove();
    adStatusSubscription = null;
  };

  const removeLibrary = () => {
    libraryStatusSubscription?.remove();
    libraryStatusSubscription = null;
  };

  const removeAll = () => {
    removeAd();
    removeLibrary();
  };

  return {
    attach,
    removeAd,
    removeAll,
    removeLibrary,
    setListener: (listener: TrackPlayerStatusListener | null) => {
      statusListener = listener;

      if (!listener) {
        removeAll();
      }
    },
  };
};

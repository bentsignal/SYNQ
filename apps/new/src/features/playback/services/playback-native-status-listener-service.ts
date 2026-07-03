import {
  PLAYBACK_STATUS_UPDATE,
  type AudioPlayer,
} from "expo-audio";
import {
  audioStatusToTrackPlayerSnapshot,
  type TrackPlayerSource,
  type TrackPlayerStatusSnapshot,
} from "./playback-native-status-service";

type AudioPlayerSubscription = ReturnType<AudioPlayer["addListener"]>;

type TrackPlayerStatusListener = (
  status: TrackPlayerStatusSnapshot,
) => void;

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
    const subscription = player?.addListener(PLAYBACK_STATUS_UPDATE, (status) => {
      statusListener?.(
        audioStatusToTrackPlayerSnapshot({
          loadedSongId: getLoadedSongId(),
          source,
          status,
        }),
      );
    });

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

import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

export const getPlaybackNativeFinishedStatusKey = (
  status: TrackPlayerStatusSnapshot,
) =>
  status.didJustFinish
    ? [
        status.source ?? "none",
        status.songId ?? status.activeTrackId ?? "none",
        status.duration ?? "unknown-duration",
      ].join(":")
    : null;

export const shouldHandlePlaybackNativeFinishedStatus = ({
  handledKey,
  status,
}: {
  handledKey: string | null;
  status: TrackPlayerStatusSnapshot;
}) => {
  const finishKey = getPlaybackNativeFinishedStatusKey(status);

  return {
    finishKey,
    shouldHandle: finishKey === null || finishKey !== handledKey,
  };
};

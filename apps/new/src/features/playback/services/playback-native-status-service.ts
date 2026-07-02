export type TrackPlayerSource = "ad" | "library";

export type TrackPlayerStatusSnapshot = {
  didJustFinish: boolean;
  duration: number | null;
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  songId: number | null;
  source: TrackPlayerSource | null;
};

type PlaybackNativeAudioStatus = {
  currentTime?: number;
  didJustFinish?: boolean;
  duration?: number;
  isLoaded: boolean;
  playing?: boolean;
};

const secondsToMilliseconds = (seconds: number | undefined) =>
  Number.isFinite(seconds) ? Number(seconds) * 1000 : null;

export const audioStatusToTrackPlayerSnapshot = ({
  loadedSongId,
  source,
  status,
}: {
  loadedSongId: number | null;
  source: TrackPlayerSource;
  status: PlaybackNativeAudioStatus;
}): TrackPlayerStatusSnapshot => {
  if (!status.isLoaded) {
    return {
      didJustFinish: false,
      duration: null,
      isLoaded: false,
      isPlaying: false,
      position: 0,
      songId: loadedSongId,
      source,
    };
  }

  return {
    didJustFinish: Boolean(status.didJustFinish),
    duration: secondsToMilliseconds(status.duration),
    isLoaded: true,
    isPlaying: Boolean(status.playing),
    position: secondsToMilliseconds(status.currentTime) ?? 0,
    songId: loadedSongId,
    source,
  };
};

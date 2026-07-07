import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export const getTrackPlayerRestoreTarget = (
  state: PlaybackState,
): {
  activeTrack: PlaybackQueueItem;
  activeTrackId: number;
  mode: PlaybackState["mode"];
  queue: PlaybackQueueItem[];
} | null => {
  const activeTrack =
    state.activeTrackId === null
      ? null
      : (state.queue.find((song) => song.id === state.activeTrackId) ?? null);

  if (!activeTrack) {
    return null;
  }

  return {
    activeTrack,
    activeTrackId: activeTrack.id,
    mode: state.mode,
    queue: state.queue,
  };
};

export const getTrackPlayerActiveLibraryTrack = ({
  activeTrackId,
  currentTrack,
  queue,
}: {
  activeTrackId: string | null | undefined;
  currentTrack: PlaybackQueueItem | null;
  queue: PlaybackQueueItem[];
}): PlaybackQueueItem | null =>
  activeTrackId === undefined || activeTrackId === null
    ? currentTrack
    : (queue.find((track) => String(track.id) === activeTrackId) ??
      currentTrack);

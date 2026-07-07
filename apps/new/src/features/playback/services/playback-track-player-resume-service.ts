import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";

export type TrackPlayerResumeLibraryOptions = {
  activeTrackId: number;
  mode: PlaybackState["mode"];
  queue: PlaybackQueueItem[];
};

export const getTrackPlayerResumeLibraryOptions = ({
  activeLibraryQueue,
  activeLibraryTrack,
  currentPlaybackMode,
}: {
  activeLibraryQueue: PlaybackQueueItem[];
  activeLibraryTrack: PlaybackQueueItem | null;
  currentPlaybackMode: PlaybackState["mode"];
}): TrackPlayerResumeLibraryOptions | null => {
  if (!activeLibraryTrack) {
    return null;
  }

  return {
    activeTrackId: activeLibraryTrack.id,
    mode: currentPlaybackMode,
    queue: activeLibraryQueue.length ? activeLibraryQueue : [activeLibraryTrack],
  };
};

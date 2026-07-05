import type { PlaybackState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-action-service";
import { bumpPlaybackQueueRevision } from "./playback-session-queue-service";
import {
  pausePlayback,
  playPlaybackSong,
  resumePlayback,
  seekPlayback,
  skipToNextPlaybackTrack,
  skipToPreviousPlaybackTrack,
} from "./playback-transport-service";

type PlaybackTransportAction = Extract<
  PlaybackAction,
  | { type: "pause" }
  | { type: "play-song" }
  | { type: "resume" }
  | { type: "seek-to" }
  | { type: "skip-next" }
  | { type: "skip-previous" }
>;

export const reducePlaybackTransportAction = ({
  action,
  state,
}: {
  action: PlaybackTransportAction;
  state: PlaybackState;
}): PlaybackState => {
  switch (action.type) {
    case "play-song":
      return bumpPlaybackQueueRevision(
        playPlaybackSong({ song: action.song, state }),
      );
    case "pause":
      return pausePlayback(state);
    case "resume":
      return resumePlayback(state);
    case "seek-to":
      return seekPlayback({ position: action.position, state });
    case "skip-next":
      return skipToNextPlaybackTrack({
        state,
        targetIndex: action.targetIndex,
      });
    case "skip-previous":
      return skipToPreviousPlaybackTrack(state);
  }
};

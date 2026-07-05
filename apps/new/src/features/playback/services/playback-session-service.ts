import type { PlaybackState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-action-service";
import {
  applyPlaybackNativeStatus,
  beginPlaybackAdBreakTransition,
  completePlaybackAdBreakTransition,
  finishPlaybackNativeTrack,
  syncPlaybackPremiumState,
} from "./playback-native-transition-service";
import { initialPlaybackState } from "./playback-initial-state-service";
import {
  bumpPlaybackQueueRevision,
} from "./playback-session-queue-service";
import { reducePlaybackQueueAction } from "./playback-session-queue-reducer-service";
import {
  pausePlayback,
  playPlaybackSong,
  resumePlayback,
  seekPlayback,
  skipToNextPlaybackTrack,
  skipToPreviousPlaybackTrack,
} from "./playback-transport-service";
import {
  failPlaybackSession,
  hydratePlaybackSession,
  togglePlaybackLoopMode,
  togglePlaybackShuffleMode,
} from "./playback-session-step-service";

export type { PlaybackAction } from "./playback-session-action-service";

export const playbackReducer = (
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState => {
  switch (action.type) {
    case "hydrate":
      return hydratePlaybackSession(action.state);
    case "reset":
      return initialPlaybackState;
    case "play-song": {
      return bumpPlaybackQueueRevision(
        playPlaybackSong({ song: action.song, state }),
      );
    }
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
    case "add-to-queue":
    case "clear-queue":
    case "remove-from-queue":
    case "move-queue-song":
      return reducePlaybackQueueAction({ action, state });
    case "begin-ad-break":
      return beginPlaybackAdBreakTransition(state);
    case "complete-ad-break":
      return completePlaybackAdBreakTransition(state);
    case "native-failure":
      return failPlaybackSession({ error: action.error, state });
    case "native-status":
      return applyPlaybackNativeStatus({
        premiumActive: action.premiumActive,
        state,
        status: action.status,
      });
    case "native-finished":
      return finishPlaybackNativeTrack({
        state,
        targetIndex: action.targetIndex,
      });
    case "sync-premium":
      return syncPlaybackPremiumState({
        premiumActive: action.premiumActive,
        state,
      });
    case "toggle-loop":
      return togglePlaybackLoopMode(state);
    case "toggle-shuffle":
      return togglePlaybackShuffleMode(state);
    case "remote-failure":
      return failPlaybackSession({ error: action.error, state });
  }
};

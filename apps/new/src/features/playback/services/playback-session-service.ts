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
import { reducePlaybackQueueAction } from "./playback-session-queue-reducer-service";
import { reducePlaybackTransportAction } from "./playback-session-transport-reducer-service";
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
    case "play-song":
    case "pause":
    case "resume":
    case "seek-to":
    case "skip-next":
    case "skip-previous":
      return reducePlaybackTransportAction({ action, state });
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

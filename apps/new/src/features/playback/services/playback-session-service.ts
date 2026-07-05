import type { PlaybackState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-action-service";
import { initialPlaybackState } from "./playback-initial-state-service";
import { reducePlaybackNativeAction } from "./playback-session-native-reducer-service";
import { reducePlaybackQueueAction } from "./playback-session-queue-reducer-service";
import { reducePlaybackTransportAction } from "./playback-session-transport-reducer-service";
import {
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
    case "complete-ad-break":
    case "native-failure":
    case "native-status":
    case "native-finished":
    case "sync-premium":
    case "remote-failure":
      return reducePlaybackNativeAction({ action, state });
    case "toggle-loop":
      return togglePlaybackLoopMode(state);
    case "toggle-shuffle":
      return togglePlaybackShuffleMode(state);
  }
};

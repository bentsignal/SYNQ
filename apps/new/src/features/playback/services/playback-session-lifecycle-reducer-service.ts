import type { PlaybackState } from "../types/playback-state";
import { initialPlaybackState } from "./playback-initial-state-service";
import type { PlaybackAction } from "./playback-session-action-service";
import {
  hydratePlaybackSession,
  togglePlaybackLoopMode,
  togglePlaybackShuffleMode,
} from "./playback-session-step-service";

type PlaybackLifecycleAction = Extract<
  PlaybackAction,
  | { type: "hydrate" }
  | { type: "reset" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" }
>;

export const reducePlaybackLifecycleAction = ({
  action,
  state,
}: {
  action: PlaybackLifecycleAction;
  state: PlaybackState;
}): PlaybackState => {
  switch (action.type) {
    case "hydrate":
      return hydratePlaybackSession(action.state);
    case "reset":
      return initialPlaybackState;
    case "toggle-loop":
      return togglePlaybackLoopMode(state);
    case "toggle-shuffle":
      return togglePlaybackShuffleMode(state);
  }
};

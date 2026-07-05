import type { PlaybackState } from "../types/playback-state";
import {
  applyPlaybackNativeStatus,
  beginPlaybackAdBreakTransition,
  completePlaybackAdBreakTransition,
  finishPlaybackNativeTrack,
  syncPlaybackPremiumState,
} from "./playback-native-transition-service";
import type { PlaybackAction } from "./playback-session-action-service";
import { failPlaybackSession } from "./playback-session-step-service";

type PlaybackNativeAction = Extract<
  PlaybackAction,
  | { type: "begin-ad-break" }
  | { type: "complete-ad-break" }
  | { type: "native-failure" }
  | { type: "native-finished" }
  | { type: "native-status" }
  | { type: "remote-failure" }
  | { type: "sync-premium" }
>;

export const reducePlaybackNativeAction = ({
  action,
  state,
}: {
  action: PlaybackNativeAction;
  state: PlaybackState;
}): PlaybackState => {
  switch (action.type) {
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
    case "remote-failure":
      return failPlaybackSession({ error: action.error, state });
  }
};

import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";
import {
  applyPlaybackNativeStatus,
  beginPlaybackAdBreakTransition,
  completePlaybackAdBreakTransition,
  finishPlaybackNativeTrack,
  syncPlaybackPremiumState,
} from "./playback-native-transition-service";
import { initialPlaybackState } from "./playback-initial-state-service";
import {
  addPlaybackQueueSong,
  bumpPlaybackQueueRevision,
  clearPlaybackQueue,
  movePlaybackQueueSong,
  removePlaybackQueueSong,
} from "./playback-session-queue-service";
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

export type PlaybackAction =
  | { song: PlaybackQueueItem; type: "play-song" }
  | { type: "pause" }
  | { type: "resume" }
  | { position: number; type: "seek-to" }
  | { targetIndex: number | null; type: "skip-next" }
  | { type: "skip-previous" }
  | { song: PlaybackQueueItem; type: "add-to-queue" }
  | { type: "clear-queue" }
  | { songId: number; type: "remove-from-queue" }
  | { direction: "down" | "up"; songId: number; type: "move-queue-song" }
  | { type: "begin-ad-break" }
  | { type: "complete-ad-break" }
  | { state: PlaybackState; type: "hydrate" }
  | { type: "reset" }
  | { error: string; type: "native-failure" }
  | { error: string; type: "remote-failure" }
  | {
      premiumActive: boolean;
      status: TrackPlayerStatusSnapshot;
      type: "native-status";
    }
  | { targetIndex: number | null; type: "native-finished" }
  | { premiumActive: boolean; type: "sync-premium" }
  | { type: "toggle-loop" }
  | { type: "toggle-shuffle" };

export type PlaybackHydrateAction = Extract<
  PlaybackAction,
  { type: "hydrate" }
>;

export const getHydratePlaybackAction = (
  state: PlaybackState,
): PlaybackHydrateAction => ({
  state,
  type: "hydrate",
});

export const getAddPlaybackQueueSongAction = (
  song: PlaybackQueueItem,
): PlaybackAction => ({
  song,
  type: "add-to-queue",
});

export const getMovePlaybackQueueSongAction = ({
  direction,
  songId,
}: {
  direction: "down" | "up";
  songId: number;
}): PlaybackAction => ({
  direction,
  songId,
  type: "move-queue-song",
});

export const getTogglePlaybackLoopAction = (): PlaybackAction => ({
  type: "toggle-loop",
});

export const getTogglePlaybackShuffleAction = (): PlaybackAction => ({
  type: "toggle-shuffle",
});

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
      return addPlaybackQueueSong({ song: action.song, state });
    case "clear-queue":
      return clearPlaybackQueue(state);
    case "remove-from-queue":
      return removePlaybackQueueSong({ songId: action.songId, state });
    case "move-queue-song":
      return movePlaybackQueueSong({
        direction: action.direction,
        songId: action.songId,
        state,
      });
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

import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import type { TrackPlayerStatusSnapshot } from "./playback-native-status-service";

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

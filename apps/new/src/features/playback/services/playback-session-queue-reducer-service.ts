import type { PlaybackState } from "../types/playback-state";
import type { PlaybackAction } from "./playback-session-action-service";
import {
  addPlaybackQueueSong,
  clearPlaybackQueue,
  movePlaybackQueueSong,
  removePlaybackQueueSong,
} from "./playback-session-queue-service";

type PlaybackQueueAction = Extract<
  PlaybackAction,
  | { type: "add-to-queue" }
  | { type: "clear-queue" }
  | { type: "move-queue-song" }
  | { type: "remove-from-queue" }
>;

export const reducePlaybackQueueAction = ({
  action,
  state,
}: {
  action: PlaybackQueueAction;
  state: PlaybackState;
}): PlaybackState => {
  switch (action.type) {
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
  }
};

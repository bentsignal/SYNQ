import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import {
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "./playback-remote-command-service";

export type PlaybackCommands = {
  addToQueue: (song: PlaybackQueueItem) => void;
  clearQueue: () => void;
  handleRemoteCommand: (
    command: PlaybackRemoteCommand,
  ) => PlaybackRemoteCommandResult;
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
  pause: () => void;
  playSong: (song: PlaybackQueueItem) => void;
  removeFromQueue: (songId: number) => void;
  resetPlaybackSession: () => void;
  resume: () => void;
  seekTo: (position: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

export type PlaybackSessionValue = PlaybackCommands & {
  activeTrack: PlaybackQueueItem | null;
  state: PlaybackState;
};

export const getPlaybackSessionValue = ({
  activeTrack,
  commands,
  state,
}: {
  activeTrack: PlaybackQueueItem | null;
  commands: PlaybackCommands;
  state: PlaybackState;
}): PlaybackSessionValue => ({
  activeTrack,
  ...commands,
  state,
});

import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import {
  getPlaybackQueueClearCommand,
  getPlaybackQueueMoveCommand,
  getPlaybackQueuePlayCommand,
  getPlaybackQueueRemoveCommand,
} from "./playback-queue-command-state-service";

type PlaybackQueueCommandDependencies = {
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const runPlaybackQueuePlayCommand = ({
  playSong,
  sendHaptic,
  song,
}: PlaybackQueueCommandDependencies & {
  playSong: (song: PlaybackQueueItem) => void;
  song: PlaybackQueueItem;
}) => {
  sendHaptic(getPlaybackQueuePlayCommand().haptic);
  playSong(song);
};

export const runPlaybackQueueRemoveCommand = ({
  removeFromQueue,
  sendHaptic,
  songId,
}: PlaybackQueueCommandDependencies & {
  removeFromQueue: (songId: number) => void;
  songId: number;
}) => {
  sendHaptic(getPlaybackQueueRemoveCommand().haptic);
  removeFromQueue(songId);
};

export const runPlaybackQueueMoveCommand = ({
  direction,
  moveQueueSong,
  sendHaptic,
  songId,
}: PlaybackQueueCommandDependencies & {
  direction: "down" | "up";
  moveQueueSong: (songId: number, direction: "down" | "up") => void;
  songId: number;
}) => {
  sendHaptic(getPlaybackQueueMoveCommand().haptic);
  moveQueueSong(songId, direction);
};

export const runPlaybackQueueClearCommand = ({
  clearQueue,
  sendHaptic,
}: PlaybackQueueCommandDependencies & {
  clearQueue: () => void;
}) => {
  sendHaptic(getPlaybackQueueClearCommand().haptic);
  clearQueue();
};

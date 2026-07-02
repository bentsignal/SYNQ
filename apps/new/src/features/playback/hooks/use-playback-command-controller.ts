import { useMemo, type RefObject } from "react";
import {
  type PlaybackRemoteCommand,
  type PlaybackRemoteCommandResult,
} from "../services/playback-remote-command-service";
import type { PlaybackNativeCommandPlan } from "../services/playback-native-command-plan-service";
import type { PlaybackAction } from "../services/playback-session-service";
import type {
  PlaybackQueueItem,
  PlaybackState,
} from "../types/playback-state";
import { usePlaybackCommandRunners } from "./use-playback-command-runners";
import { usePlaybackQueueCommands } from "./use-playback-queue-commands";
import { usePlaybackRemoteCommandController } from "./use-playback-remote-command-controller";
import { usePlaybackTransportCommands } from "./use-playback-transport-commands";

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

type UsePlaybackCommandControllerParams = {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  finishActiveTrack: () => void;
  runNativeCommandPlan: (plan: PlaybackNativeCommandPlan) => void;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackCommandController({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  finishActiveTrack,
  runNativeCommandPlan,
  stateRef,
}: UsePlaybackCommandControllerParams): PlaybackCommands {
  const { runAdGatedCommand, runCommandPlan } = usePlaybackCommandRunners({
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    runNativeCommandPlan,
  });

  const transportCommands = usePlaybackTransportCommands({
    runAdGatedCommand,
    runCommandPlan,
    stateRef,
  });
  const queueCommands = usePlaybackQueueCommands({
    dispatch,
    runCommandPlan,
    stateRef,
  });
  const handleRemoteCommand = usePlaybackRemoteCommandController({
    beginAdBreak,
    canRunPlaybackCommand,
    finishActiveTrack,
    pause: transportCommands.pause,
    runCommandPlan,
    resume: transportCommands.resume,
    seekTo: transportCommands.seekTo,
    skipNext: transportCommands.skipNext,
    skipPrevious: transportCommands.skipPrevious,
  });

  return useMemo(
    () => ({
      handleRemoteCommand,
      ...queueCommands,
      ...transportCommands,
    }),
    [
      handleRemoteCommand,
      queueCommands,
      transportCommands,
    ],
  );
}

import { Effect, Layer } from "effect";

import {
  initialPlaybackState,
  PlaybackInvalidCommandError,
  type PlaybackCommand,
  type PlaybackEvent,
  type PlaybackState,
} from "./domain";
import { NativePlayer, type NativePlayerService } from "./native-player";
import {
  getNextPlaybackTrackId,
  getPlaybackQueueActiveTrack,
  getPreviousPlaybackTrackId,
  setPlaybackQueueMode,
  setPlaybackQueueActiveTrack,
} from "./queue";

export type FakeNativePlayerController = {
  emit: (event: PlaybackEvent) => void;
  getSnapshot: () => PlaybackState;
};

type FakeNativePlayerOptions = {
  controller?: (controller: FakeNativePlayerController) => void;
  initialState?: PlaybackState;
};

const setActiveTrack = (
  state: PlaybackState,
  trackId: string | null,
): PlaybackState => {
  const queue = setPlaybackQueueActiveTrack(state.queue, trackId);
  const activeTrack = getPlaybackQueueActiveTrack(queue);

  return {
    ...state,
    activeTrack,
    durationMs: activeTrack?.durationMs ?? 0,
    positionMs: 0,
    queue,
  };
};

const runFakeCommand = (
  state: PlaybackState,
  command: PlaybackCommand,
): PlaybackState => {
  switch (command._tag) {
    case "Configure":
      return state;
    case "LoadQueue":
      return {
        ...setActiveTrack(
          {
            ...state,
            queue: command.queue,
          },
          command.queue.activeTrackId,
        ),
        status: command.queue.activeTrackId === null ? "idle" : state.status,
      };
    case "Play": {
      const trackId =
        command.trackId ??
        state.queue.activeTrackId ??
        state.queue.tracks[0]?.id ??
        null;

      if (trackId === null) {
        throw new PlaybackInvalidCommandError({
          command,
          message: "Cannot play without a track.",
        });
      }

      return {
        ...setActiveTrack(state, trackId),
        status: "playing",
      };
    }
    case "Pause":
      return {
        ...state,
        status: state.status === "idle" ? "idle" : "paused",
      };
    case "Stop":
      return {
        ...state,
        positionMs: 0,
        status: "idle",
      };
    case "SeekTo":
      return {
        ...state,
        positionMs: Math.max(0, Math.min(command.positionMs, state.durationMs)),
      };
    case "SkipNext":
      return setActiveTrackAndStatus(state, getNextPlaybackTrackId(state.queue));
    case "SkipPrevious":
      return setActiveTrackAndStatus(
        state,
        getPreviousPlaybackTrackId(state.queue),
      );
    case "SetQueueMode":
      return {
        ...state,
        queue: setPlaybackQueueMode(state.queue, command.mode),
      };
    case "SetPlaybackRate":
      return {
        ...state,
        playbackRate: command.rate,
      };
  }
};

const setActiveTrackAndStatus = (
  state: PlaybackState,
  trackId: string | null,
): PlaybackState => {
  const nextState = setActiveTrack(state, trackId);

  return {
    ...nextState,
    status: nextState.activeTrack ? "playing" : "idle",
  };
};

export const makeFakeNativePlayer = ({
  controller,
  initialState = initialPlaybackState,
}: FakeNativePlayerOptions = {}): NativePlayerService => {
  let state = initialState;
  const listeners = new Set<(event: PlaybackEvent) => void>();

  const emit = (event: PlaybackEvent) => {
    listeners.forEach((listener) => listener(event));
  };

  controller?.({
    emit,
    getSnapshot: () => state,
  });

  return {
    addEventListener: (listener) =>
      Effect.sync(() => {
        listeners.add(listener);
        return {
          remove: () => {
            listeners.delete(listener);
          },
        };
      }),
    execute: (command) =>
      Effect.try({
        try: () => {
          state = runFakeCommand(state, command);
          emit({ _tag: "StateChanged", state });
          return state;
        },
        catch: (cause) =>
          cause instanceof PlaybackInvalidCommandError
            ? cause
            : new PlaybackInvalidCommandError({
                command,
                message: cause instanceof Error ? cause.message : String(cause),
              }),
      }),
    getState: () => Effect.sync(() => state),
  };
};

export const FakeNativePlayerLayer = (options?: FakeNativePlayerOptions) =>
  Layer.succeed(NativePlayer, makeFakeNativePlayer(options));

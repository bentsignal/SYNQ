import { Effect, Layer } from "effect";

import SynqNativeAudioModule from "./SynqNativeAudioModule";
import {
  PlaybackNativeError,
  type PlaybackCommand,
  type PlaybackEvent,
  type PlaybackRemoteCommand,
  type PlaybackState,
  type PlaybackStatus,
} from "./domain";
import { NativePlayer, type NativePlayerService } from "./native-player";
import type {
  SynqNativeAudioPlaybackEvent,
  SynqNativeAudioPlaybackState,
} from "./SynqNativeAudio.types";

const toPlaybackState = (
  state: SynqNativeAudioPlaybackState,
): PlaybackState => ({
  activeTrack: state.activeTrack,
  bufferedPositionMs: state.bufferedPositionMs,
  durationMs: state.durationMs,
  playbackRate: state.playbackRate,
  positionMs: state.positionMs,
  queue: state.queue,
  status: state.status as PlaybackStatus,
});

const toPlaybackEvent = (
  event: SynqNativeAudioPlaybackEvent,
): PlaybackEvent | null => {
  switch (event.type) {
    case "StateChanged":
      return {
        _tag: "StateChanged",
        state: toPlaybackState(event.state),
      };
    case "RemoteCommand":
      return {
        _tag: "RemoteCommand",
        command: event.command as PlaybackRemoteCommand,
        positionMs: event.positionMs,
      };
    case "InterruptionBegan":
      return {
        _tag: "InterruptionBegan",
      };
    case "InterruptionEnded":
      return {
        _tag: "InterruptionEnded",
        shouldResume: event.shouldResume,
      };
    case "RouteChanged":
      return {
        _tag: "RouteChanged",
        reason: event.reason,
      };
  }
};

const runNativeCommand = (command: PlaybackCommand) =>
  Effect.tryPromise({
    try: async () => {
      switch (command._tag) {
        case "Configure":
          return toPlaybackState(
            await SynqNativeAudioModule.configure(command.options),
          );
        case "LoadQueue":
          return toPlaybackState(await SynqNativeAudioModule.loadQueue(command.queue));
        case "Play":
          return toPlaybackState(await SynqNativeAudioModule.play(command.trackId));
        case "Pause":
          return toPlaybackState(await SynqNativeAudioModule.pause());
        case "Stop":
          return toPlaybackState(await SynqNativeAudioModule.stop());
        case "SeekTo":
          return toPlaybackState(
            await SynqNativeAudioModule.seekTo(command.positionMs),
          );
        case "SkipNext":
          return toPlaybackState(await SynqNativeAudioModule.skipNext());
        case "SkipPrevious":
          return toPlaybackState(await SynqNativeAudioModule.skipPrevious());
        case "SetPlaybackRate":
          return toPlaybackState(
            await SynqNativeAudioModule.setPlaybackRate(command.rate),
          );
      }
    },
    catch: (cause) =>
      new PlaybackNativeError({
        cause,
        command,
        message: cause instanceof Error ? cause.message : String(cause),
      }),
  });

export const makeNativeModulePlayer = (): NativePlayerService => ({
  addEventListener: (listener) =>
    Effect.sync(() => {
      const subscription = SynqNativeAudioModule.addListener(
        "onPlaybackEvent",
        (event) => {
          const playbackEvent = toPlaybackEvent(event);
          if (playbackEvent) {
            listener(playbackEvent);
          }
        },
      );

      return {
        remove: () => {
          subscription.remove();
        },
      };
    }),
  execute: runNativeCommand,
  getState: () =>
    Effect.tryPromise({
      try: async () => toPlaybackState(await SynqNativeAudioModule.getState()),
      catch: (cause) =>
        new PlaybackNativeError({
          cause,
          message: cause instanceof Error ? cause.message : String(cause),
        }),
    }),
});

export const NativeModulePlayerLayer = Layer.succeed(
  NativePlayer,
  makeNativeModulePlayer(),
);

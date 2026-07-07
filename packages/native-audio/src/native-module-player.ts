import { Effect, Layer } from "effect";

import SynqNativeAudioModule from "./SynqNativeAudioModule";
import {
  PlaybackNativeError,
  type PlaybackCommand,
} from "./domain";
import {
  toPlaybackEvent,
  toPlaybackState,
} from "./native-module-event-mapper";
import { NativePlayer, type NativePlayerService } from "./native-player";

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
        case "SetQueueMode":
          return toPlaybackState(await SynqNativeAudioModule.setQueueMode(command.mode));
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

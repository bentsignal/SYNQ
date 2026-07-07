import { Context, Effect } from "effect";

import type {
  PlaybackCommand,
  PlaybackError,
  PlaybackEvent,
  PlaybackState,
} from "./domain";

export type PlaybackEventSubscription = {
  remove: () => void;
};

export type NativePlayerService = {
  addEventListener: (
    listener: (event: PlaybackEvent) => void,
  ) => Effect.Effect<PlaybackEventSubscription, PlaybackError>;
  execute: (command: PlaybackCommand) => Effect.Effect<PlaybackState, PlaybackError>;
  getState: () => Effect.Effect<PlaybackState, PlaybackError>;
};

export class NativePlayer extends Context.Tag(
  "@synq/native-audio/NativePlayer",
)<NativePlayer, NativePlayerService>() {}

export const executePlaybackCommand = (command: PlaybackCommand) =>
  Effect.flatMap(NativePlayer, (player) => player.execute(command));

export const getPlaybackState = Effect.flatMap(NativePlayer, (player) =>
  player.getState(),
);

export const addPlaybackEventListener = (
  listener: (event: PlaybackEvent) => void,
) =>
  Effect.flatMap(NativePlayer, (player) => player.addEventListener(listener));


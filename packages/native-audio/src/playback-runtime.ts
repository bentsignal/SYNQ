import { Effect, ManagedRuntime } from "effect";

import type { PlaybackCommand, PlaybackError, PlaybackState } from "./domain";
import {
  addPlaybackEventListener,
  NativePlayer,
  executePlaybackCommand,
  getPlaybackState,
  type PlaybackEventSubscription,
} from "./native-player";

export type PlaybackCommandRuntime = {
  addEventListener: (
    listener: Parameters<typeof addPlaybackEventListener>[0],
  ) => PlaybackEventSubscription;
  getState: () => Promise<PlaybackState>;
  runCommand: (command: PlaybackCommand) => Promise<PlaybackState>;
};

export const makePlaybackCommandRuntime = (
  runtime: ManagedRuntime.ManagedRuntime<NativePlayer, never>,
): PlaybackCommandRuntime => {
  let previous = Promise.resolve();

  const runSerialized = <A>(
    effect: Effect.Effect<A, PlaybackError, NativePlayer>,
  ): Promise<A> => {
    const next = previous.then(() => runtime.runPromise(effect));
    previous = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  };

  return {
    addEventListener: (listener) =>
      runtime.runSync(addPlaybackEventListener(listener)),
    getState: () => runtime.runPromise(getPlaybackState),
    runCommand: (command) => runSerialized(executePlaybackCommand(command)),
  };
};

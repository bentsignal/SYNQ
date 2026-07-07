import type { PlaybackEvent } from "@synq/native-audio";

export const shouldEmitState = (event: PlaybackEvent): event is Extract<
  PlaybackEvent,
  { _tag: "StateChanged" }
> => event._tag === "StateChanged";

export const shouldHandleRemoteCommand = (
  event: PlaybackEvent,
): event is Extract<PlaybackEvent, { _tag: "RemoteCommand" }> =>
  event._tag === "RemoteCommand";

export const shouldHandleInterruption = (
  event: PlaybackEvent,
): event is Extract<
  PlaybackEvent,
  { _tag: "InterruptionBegan" | "InterruptionEnded" }
> => event._tag === "InterruptionBegan" || event._tag === "InterruptionEnded";

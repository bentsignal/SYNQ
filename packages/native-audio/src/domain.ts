import { Data } from "effect";

export type PlaybackTrack = {
  albumTitle?: string;
  artistName?: string;
  artworkUri?: string;
  durationMs?: number;
  id: string;
  title: string;
  uri: string;
};

export type PlaybackQueue = {
  activeTrackId: string | null;
  tracks: ReadonlyArray<PlaybackTrack>;
};

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "buffering"
  | "ended"
  | "failed";

export type PlaybackState = {
  activeTrack: PlaybackTrack | null;
  bufferedPositionMs: number;
  durationMs: number;
  playbackRate: number;
  positionMs: number;
  queue: PlaybackQueue;
  status: PlaybackStatus;
};

export type PlaybackCommand =
  | { readonly _tag: "Configure"; readonly options: PlaybackSessionOptions }
  | { readonly _tag: "LoadQueue"; readonly queue: PlaybackQueue }
  | { readonly _tag: "Play"; readonly trackId?: string }
  | { readonly _tag: "Pause" }
  | { readonly _tag: "Stop" }
  | { readonly _tag: "SeekTo"; readonly positionMs: number }
  | { readonly _tag: "SkipNext" }
  | { readonly _tag: "SkipPrevious" }
  | { readonly _tag: "SetPlaybackRate"; readonly rate: number };

export type PlaybackRemoteCommand =
  | "play"
  | "pause"
  | "togglePlayPause"
  | "stop"
  | "next"
  | "previous"
  | "seek";

export type PlaybackEvent =
  | { readonly _tag: "StateChanged"; readonly state: PlaybackState }
  | { readonly _tag: "RemoteCommand"; readonly command: PlaybackRemoteCommand; readonly positionMs?: number }
  | { readonly _tag: "InterruptionBegan" }
  | { readonly _tag: "InterruptionEnded"; readonly shouldResume: boolean }
  | { readonly _tag: "RouteChanged"; readonly reason: string }
  | { readonly _tag: "CommandFailed"; readonly command: PlaybackCommand; readonly error: PlaybackError };

export type PlaybackSessionOptions = {
  androidNotificationChannelId?: string;
  androidNotificationChannelName?: string;
  iosCategory?: "ambient" | "playback" | "playAndRecord";
  playsInBackground: boolean;
};

export const initialPlaybackQueue: PlaybackQueue = {
  activeTrackId: null,
  tracks: [],
};

export const initialPlaybackState: PlaybackState = {
  activeTrack: null,
  bufferedPositionMs: 0,
  durationMs: 0,
  playbackRate: 1,
  positionMs: 0,
  queue: initialPlaybackQueue,
  status: "idle",
};

export class PlaybackNativeError extends Data.TaggedError(
  "PlaybackNativeError",
)<{
  readonly cause?: unknown;
  readonly command?: PlaybackCommand;
  readonly message: string;
}> {}

export class PlaybackUnsupportedError extends Data.TaggedError(
  "PlaybackUnsupportedError",
)<{
  readonly command?: PlaybackCommand;
  readonly message: string;
}> {}

export class PlaybackInvalidCommandError extends Data.TaggedError(
  "PlaybackInvalidCommandError",
)<{
  readonly command: PlaybackCommand;
  readonly message: string;
}> {}

export type PlaybackError =
  | PlaybackInvalidCommandError
  | PlaybackNativeError
  | PlaybackUnsupportedError;


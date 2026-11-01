/** A playable item. Durations are milliseconds. */
export interface Track {
  id: string;
  /** Absolute local file URL (`file:///…/Documents/library/…`). */
  url: string;
  title: string;
  artist: string;
  album?: string;
  /** Absolute local file URL of the cover shown on the lock screen. */
  artworkUrl?: string;
  durationMs?: number;
}

export type RepeatMode = "off" | "all" | "one";

export type PlaybackStatus =
  /** Nothing is loaded. */
  | "idle"
  /** Loading or buffering while playback is wanted. */
  | "loading"
  | "playing"
  | "paused"
  /** The queue played to its end (repeat off). */
  | "ended"
  /** Nothing in the queue could play. */
  | "error";

export interface PlaybackState {
  status: PlaybackStatus;
  /** Index of the current queue entry. */
  index: number | null;
  /** Id of the current track. */
  trackId: string | null;
  positionMs: number;
  durationMs: number;
  repeatMode: RepeatMode;
  queueLength: number;
}

export interface Progress {
  positionMs: number;
  durationMs: number;
}

export interface QueueChange {
  length: number;
  index: number | null;
}

export type PlaybackErrorCode =
  | "file-missing"
  | "load-failed"
  | "playback-failed"
  | "audio-session";

export interface PlaybackError {
  code: PlaybackErrorCode;
  message: string;
  trackId: string | null;
  index: number | null;
}

export interface SetQueueOptions {
  /** Default 0. */
  startIndex?: number;
  /**
   * Where to start. Default 0. When the track at `startIndex` is already
   * playing, it keeps playing and only seeks if this is given.
   */
  positionMs?: number;
  /**
   * Default true for a new track; when the current track is kept, its play
   * state is kept unless this is given. Restore at launch with `false`.
   */
  play?: boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- expo's `NativeModule<EventsMap>` needs an index signature, which interfaces lack
export type AudioEvents = {
  state: (state: PlaybackState) => void;
  /** About twice a second while playing, and on seeks and track changes. */
  progress: (progress: Progress) => void;
  queue: (change: QueueChange) => void;
  error: (error: PlaybackError) => void;
};

export type AudioEventName = keyof AudioEvents;

export interface Subscription {
  remove(): void;
}

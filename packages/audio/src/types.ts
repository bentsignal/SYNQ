/** A playable item. Durations are milliseconds. */
export type Track = {
  id: string;
  /** Absolute local file URL (`file:///…/Documents/library/…`). */
  url: string;
  title: string;
  artist: string;
  album?: string;
  /** Absolute local file URL of the cover shown on the lock screen. */
  artworkUrl?: string;
  durationMs?: number;
};

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

export type PlaybackState = {
  status: PlaybackStatus;
  /**
   * Index of the current queue entry. While the interstitial plays, the
   * index of the entry that plays after it.
   */
  index: number | null;
  /** Id of the audible track (the interstitial's id while it plays). */
  trackId: string | null;
  positionMs: number;
  durationMs: number;
  repeatMode: RepeatMode;
  queueLength: number;
  /** The interstitial is playing: skipping and seeking are disabled. */
  interstitial: boolean;
  /** Listening time counted toward the interstitial (persist it). */
  listenedMs: number;
};

export type Progress = {
  positionMs: number;
  durationMs: number;
};

export type QueueChange = {
  length: number;
  index: number | null;
};

export type PlaybackErrorCode =
  | "file-missing"
  | "load-failed"
  | "playback-failed"
  | "interstitial-failed"
  | "audio-session";

export type PlaybackError = {
  code: PlaybackErrorCode;
  message: string;
  trackId: string | null;
  index: number | null;
};

export type SetQueueOptions = {
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
};

export type InterstitialConfig = {
  track: Track;
  /** Listening time after which the next transition plays `track` first. */
  afterListeningMs: number;
  /**
   * Listening time already counted, restored from storage at launch. Omit it
   * to keep the count native already has (e.g. when reconfiguring).
   */
  listenedMs?: number;
};

export type AudioEvents = {
  state: (state: PlaybackState) => void;
  /** About twice a second while playing, and on seeks and track changes. */
  progress: (progress: Progress) => void;
  queue: (change: QueueChange) => void;
  error: (error: PlaybackError) => void;
  interstitialStart: () => void;
  interstitialEnd: (event: { listenedMs: number }) => void;
};

export type AudioEventName = keyof AudioEvents;

export type Subscription = { remove(): void };

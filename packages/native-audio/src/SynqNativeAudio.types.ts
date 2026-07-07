export type SynqNativeAudioModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onPlaybackEvent: (event: SynqNativeAudioPlaybackEvent) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type SynqNativeAudioPlaybackEvent =
  | { type: "StateChanged"; state: SynqNativeAudioPlaybackState }
  | {
      activeTrackId?: string | null;
      positionMs?: number;
      type: "RemoteCommand";
      command: string;
    }
  | { type: "InterruptionBegan" }
  | { shouldResume: boolean; type: "InterruptionEnded" }
  | { reason: string; type: "RouteChanged" };

export type SynqNativeAudioPlaybackTrack = {
  albumTitle?: string;
  artistName?: string;
  artworkUri?: string;
  durationMs?: number;
  id: string;
  title: string;
  uri: string;
};

export type SynqNativeAudioPlaybackQueue = {
  activeTrackId: string | null;
  mode: SynqNativeAudioPlaybackQueueMode;
  tracks: ReadonlyArray<SynqNativeAudioPlaybackTrack>;
};

export type SynqNativeAudioPlaybackQueueMode = {
  loop: boolean;
  shuffle: boolean;
};

export type SynqNativeAudioPlaybackState = {
  activeTrack: SynqNativeAudioPlaybackTrack | null;
  bufferedPositionMs: number;
  durationMs: number;
  playbackRate: number;
  positionMs: number;
  queue: SynqNativeAudioPlaybackQueue;
  status: string;
};

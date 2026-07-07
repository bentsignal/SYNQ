import { NativeModule, registerWebModule } from "expo";

import {
  SynqNativeAudioModuleEvents,
  type SynqNativeAudioPlaybackQueue,
  type SynqNativeAudioPlaybackState,
} from "./SynqNativeAudio.types";
import { clampPlaybackRate } from "./domain";

const emptyState: SynqNativeAudioPlaybackState = {
  activeTrack: null,
  bufferedPositionMs: 0,
  durationMs: 0,
  playbackRate: 1,
  positionMs: 0,
  queue: {
    activeTrackId: null,
    mode: {
      loop: false,
      shuffle: false,
    },
    tracks: [],
  },
  status: "idle",
};

class SynqNativeAudioModule extends NativeModule<SynqNativeAudioModuleEvents> {
  async configure(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }

  getModuleName(): string {
    return "SynqNativeAudio";
  }

  async getState(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }

  async loadQueue(
    queue: SynqNativeAudioPlaybackQueue,
  ): Promise<SynqNativeAudioPlaybackState> {
    return {
      ...emptyState,
      activeTrack:
        queue.tracks.find((track) => track.id === queue.activeTrackId) ?? null,
      durationMs:
        queue.tracks.find((track) => track.id === queue.activeTrackId)
          ?.durationMs ?? 0,
      queue,
    };
  }

  async pause(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }

  async play(): Promise<SynqNativeAudioPlaybackState> {
    return {
      ...emptyState,
      status: "playing",
    };
  }

  async seekTo(positionMs: number): Promise<SynqNativeAudioPlaybackState> {
    return {
      ...emptyState,
      positionMs,
    };
  }

  async setPlaybackRate(rate: number): Promise<SynqNativeAudioPlaybackState> {
    return {
      ...emptyState,
      playbackRate: clampPlaybackRate(rate),
    };
  }

  async setQueueMode(
    mode: SynqNativeAudioPlaybackQueue["mode"],
  ): Promise<SynqNativeAudioPlaybackState> {
    return {
      ...emptyState,
      queue: {
        ...emptyState.queue,
        mode,
      },
    };
  }

  async skipNext(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }

  async skipPrevious(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }

  async stop(): Promise<SynqNativeAudioPlaybackState> {
    return emptyState;
  }
}

export default registerWebModule(SynqNativeAudioModule, "SynqNativeAudioModule");

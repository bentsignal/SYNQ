import { NativeModule, requireNativeModule } from "expo";

import {
  SynqNativeAudioModuleEvents,
  type SynqNativeAudioPlaybackQueue,
  type SynqNativeAudioPlaybackState,
} from "./SynqNativeAudio.types";

declare class SynqNativeAudioModule extends NativeModule<SynqNativeAudioModuleEvents> {
  configure(options: Record<string, unknown>): Promise<SynqNativeAudioPlaybackState>;
  getModuleName(): string;
  getState(): Promise<SynqNativeAudioPlaybackState>;
  loadQueue(queue: SynqNativeAudioPlaybackQueue): Promise<SynqNativeAudioPlaybackState>;
  pause(): Promise<SynqNativeAudioPlaybackState>;
  play(trackId?: string): Promise<SynqNativeAudioPlaybackState>;
  seekTo(positionMs: number): Promise<SynqNativeAudioPlaybackState>;
  setQueueMode(mode: SynqNativeAudioPlaybackQueue["mode"]): Promise<SynqNativeAudioPlaybackState>;
  setPlaybackRate(rate: number): Promise<SynqNativeAudioPlaybackState>;
  skipNext(): Promise<SynqNativeAudioPlaybackState>;
  skipPrevious(): Promise<SynqNativeAudioPlaybackState>;
  stop(): Promise<SynqNativeAudioPlaybackState>;
}

export default requireNativeModule<SynqNativeAudioModule>("SynqNativeAudio");

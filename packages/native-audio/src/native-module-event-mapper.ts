import type {
  PlaybackEvent,
  PlaybackRemoteCommand,
  PlaybackState,
  PlaybackStatus,
} from "./domain";
import type {
  SynqNativeAudioPlaybackEvent,
  SynqNativeAudioPlaybackState,
} from "./SynqNativeAudio.types";

const playbackRemoteCommands = new Set<PlaybackRemoteCommand>([
  "next",
  "pause",
  "play",
  "previous",
  "seek",
  "stop",
  "togglePlayPause",
]);

const isPlaybackRemoteCommand = (
  command: string,
): command is PlaybackRemoteCommand =>
  playbackRemoteCommands.has(command as PlaybackRemoteCommand);

export const toPlaybackState = (
  state: SynqNativeAudioPlaybackState,
): PlaybackState => ({
  activeTrack: state.activeTrack,
  bufferedPositionMs: state.bufferedPositionMs,
  durationMs: state.durationMs,
  playbackRate: state.playbackRate,
  positionMs: state.positionMs,
  queue: state.queue,
  status: state.status as PlaybackStatus,
});

export const toPlaybackEvent = (
  event: SynqNativeAudioPlaybackEvent,
): PlaybackEvent | null => {
  switch (event.type) {
    case "StateChanged":
      return {
        _tag: "StateChanged",
        state: toPlaybackState(event.state),
      };
    case "RemoteCommand":
      if (!isPlaybackRemoteCommand(event.command)) {
        return null;
      }

      return {
        _tag: "RemoteCommand",
        activeTrackId: event.activeTrackId,
        command: event.command,
        positionMs: event.positionMs,
      };
    case "InterruptionBegan":
      return {
        _tag: "InterruptionBegan",
      };
    case "InterruptionEnded":
      return {
        _tag: "InterruptionEnded",
        shouldResume: event.shouldResume,
      };
    case "RouteChanged":
      return {
        _tag: "RouteChanged",
        reason: event.reason,
      };
  }
};

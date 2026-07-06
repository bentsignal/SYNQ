import type { PlaybackRemoteCommand } from "./playback-remote-command-service";

type NativeRemoteCommandEvent = {
  _tag: "RemoteCommand";
  command: "next" | "pause" | "play" | "previous" | "seek" | "stop" | "togglePlayPause";
  positionMs?: number;
};

type NativeRemoteCommandState = {
  positionMs?: number;
  status?: string;
};

export const getPlaybackRemoteCommandFromNativeEvent = ({
  event,
  state,
}: {
  event: NativeRemoteCommandEvent;
  state: NativeRemoteCommandState | null;
}): PlaybackRemoteCommand => {
  switch (event.command) {
    case "play":
      return { type: "play" };
    case "pause":
    case "stop":
      return { type: "pause" };
    case "togglePlayPause":
      return {
        type: state?.status === "playing" ? "pause" : "play",
      };
    case "next":
      return { type: "next" };
    case "previous":
      return { type: "previous" };
    case "seek":
      return {
        position: event.positionMs ?? state?.positionMs ?? 0,
        type: "seek",
      };
  }
};

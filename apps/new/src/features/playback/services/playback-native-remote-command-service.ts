import type { PlaybackRemoteCommand } from "./playback-remote-command-service";

type NativeRemoteCommandEvent = {
  _tag: "RemoteCommand";
  activeTrackId?: string | null;
  command: "next" | "pause" | "play" | "previous" | "seek" | "stop" | "togglePlayPause";
  positionMs?: number;
};

type NativeRemoteCommandState = {
  positionMs?: number;
  status?: string;
};

const getSeekPosition = ({
  eventPosition,
  statePosition,
}: {
  eventPosition: number | undefined;
  statePosition: number | undefined;
}) => {
  const position = eventPosition ?? statePosition ?? 0;

  return Number.isFinite(position) ? Math.max(0, position) : 0;
};

const getTargetTrackId = (activeTrackId: string | null | undefined) => {
  if (activeTrackId === undefined) {
    return undefined;
  }

  if (activeTrackId === null) {
    return null;
  }

  const targetTrackId = Number(activeTrackId);

  return Number.isFinite(targetTrackId) ? targetTrackId : undefined;
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
      if (event.activeTrackId === null) {
        return { type: "queue-ended" };
      }

      return {
        targetTrackId: getTargetTrackId(event.activeTrackId),
        type: "next",
      };
    case "previous":
      return {
        targetTrackId: getTargetTrackId(event.activeTrackId),
        type: "previous",
      };
    case "seek":
      return {
        position: getSeekPosition({
          eventPosition: event.positionMs,
          statePosition: state?.positionMs,
        }),
        type: "seek",
      };
  }
};

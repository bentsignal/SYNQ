import type { RefObject } from "react";
import { runPlaybackTrackAdvancementCommand } from "./playback-track-advancement-command-flow-service";
import type { PlaybackAction } from "./playback-session-action-service";
import type { TrackPlayerAdapter } from "./track-player-adapter";
import type { PlaybackState } from "../types/playback-state";

type CreatePlaybackTrackAdvancementCommandParams = {
  adapter: Pick<TrackPlayerAdapter, "play">;
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  runNativeCommand: (command: () => Promise<void>) => void;
  stateRef: RefObject<PlaybackState>;
};

export type PlaybackTrackAdvancementCommand = () => void;

export const createPlaybackTrackAdvancementCommand = ({
  adapter,
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  runNativeCommand,
  stateRef,
}: CreatePlaybackTrackAdvancementCommandParams): PlaybackTrackAdvancementCommand =>
  () => {
    runPlaybackTrackAdvancementCommand({
      beginAdBreak,
      canRunPlaybackCommand,
      dispatch,
      playNativeTrack: adapter.play,
      runNativeCommand,
      state: stateRef.current,
    });
  };

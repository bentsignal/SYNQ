import { useMemo, type RefObject } from "react";
import type { PlaybackAction } from "../services/playback-session-action-service";
import {
  createPlaybackTrackAdvancementCommand,
} from "../services/playback-track-advancement-command-service";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";
import type { PlaybackState } from "../types/playback-state";

type UsePlaybackTrackAdvancementParams = {
  adapter: TrackPlayerAdapter;
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  runNativeCommand: (command: () => Promise<void>) => void;
  stateRef: RefObject<PlaybackState>;
};

export function usePlaybackTrackAdvancement({
  adapter,
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  runNativeCommand,
  stateRef,
}: UsePlaybackTrackAdvancementParams) {
  return useMemo(
    () =>
      createPlaybackTrackAdvancementCommand({
        adapter,
        beginAdBreak,
        canRunPlaybackCommand,
        dispatch,
        runNativeCommand,
        stateRef,
      }),
    [
      adapter,
      beginAdBreak,
      canRunPlaybackCommand,
      dispatch,
      runNativeCommand,
      stateRef,
    ],
  );
}

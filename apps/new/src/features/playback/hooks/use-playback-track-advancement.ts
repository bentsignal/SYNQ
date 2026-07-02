import { useCallback, type RefObject } from "react";
import { getNextQueueIndex } from "../services/playback-queue-service";
import type { PlaybackAction } from "../services/playback-session-service";
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
  return useCallback(() => {
    if (!canRunPlaybackCommand()) {
      beginAdBreak();
      return;
    }

    const targetIndex = getNextQueueIndex({
      activeQueueIndex: stateRef.current.activeQueueIndex,
      loop: stateRef.current.mode.loop,
      queue: stateRef.current.queue,
      shuffle: stateRef.current.mode.shuffle,
    });
    const targetTrack =
      targetIndex === null ? null : stateRef.current.queue[targetIndex] ?? null;

    dispatch({ targetIndex, type: "native-finished" });
    if (targetTrack) {
      runNativeCommand(() => adapter.play(targetTrack));
    }
  }, [
    adapter,
    beginAdBreak,
    canRunPlaybackCommand,
    dispatch,
    runNativeCommand,
    stateRef,
  ]);
}

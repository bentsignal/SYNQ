import type { PlaybackQueueItem, PlaybackState } from "../types/playback-state";
import { getPlaybackNativeFinishedAction } from "./playback-native-transition-service";
import { getNextQueueIndex } from "./playback-queue-selection-service";
import type { PlaybackAction } from "./playback-session-action-service";

export const runPlaybackTrackAdvancementCommand = ({
  beginAdBreak,
  canRunPlaybackCommand,
  dispatch,
  playNativeTrack,
  runNativeCommand,
  state,
}: {
  beginAdBreak: () => void;
  canRunPlaybackCommand: () => boolean;
  dispatch: (action: PlaybackAction) => void;
  playNativeTrack: (track: PlaybackQueueItem) => Promise<void>;
  runNativeCommand: (command: () => Promise<void>) => void;
  state: PlaybackState;
}) => {
  if (!canRunPlaybackCommand()) {
    beginAdBreak();
    return { result: "started-ad" as const, targetIndex: null };
  }

  const targetIndex = getNextQueueIndex({
    activeQueueIndex: state.activeQueueIndex,
    loop: state.mode.loop,
    queue: state.queue,
    shuffle: state.mode.shuffle,
  });
  const targetTrack = targetIndex === null ? null : state.queue[targetIndex] ?? null;

  dispatch(getPlaybackNativeFinishedAction(targetIndex));
  if (targetTrack) {
    runNativeCommand(() => playNativeTrack(targetTrack));
  }

  return { result: "advanced" as const, targetIndex };
};

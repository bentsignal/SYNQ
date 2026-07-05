import { useMemo } from "react";
import {
  createPlaybackNativeCommandRunner,
} from "../services/playback-native-command-runner-service";
import type { PlaybackAction } from "../services/playback-session-action-service";
import type { TrackPlayerAdapter } from "../services/track-player-adapter";

type UsePlaybackNativeCommandRunnerParams = {
  adapter: TrackPlayerAdapter;
  dispatch: (action: PlaybackAction) => void;
};

export function usePlaybackNativeCommandRunner({
  adapter,
  dispatch,
}: UsePlaybackNativeCommandRunnerParams) {
  return useMemo(
    () => createPlaybackNativeCommandRunner({ adapter, dispatch }),
    [adapter, dispatch],
  );
}

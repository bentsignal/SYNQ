import { usePathname } from "expo-router";
import { getPlaybackMiniPlayerViewState } from "../services/playback-screen-state-service";
import {
  usePlaybackActiveTrack,
  usePlaybackState,
  usePlaybackToggleActions,
} from "./use-playback-session-selectors";

export function usePlaybackMiniPlayerController() {
  const pathname = usePathname();
  const activeTrack = usePlaybackActiveTrack();
  const { pause, resume } = usePlaybackToggleActions();
  const state = usePlaybackState();
  const { miniPlayer, playerHref } = getPlaybackMiniPlayerViewState({
    activeTrack,
    pathname,
    state,
  });

  return {
    miniPlayer,
    pause,
    playerHref,
    resume,
    state,
  };
}

export type PlaybackMiniPlayerController = ReturnType<
  typeof usePlaybackMiniPlayerController
>;

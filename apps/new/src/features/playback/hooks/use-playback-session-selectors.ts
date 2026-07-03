import { useMemo } from "react";
import { usePlaybackSessionSelector } from "./use-playback-session";

export function usePlaybackActiveTrack() {
  return usePlaybackSessionSelector((store) => store.activeTrack);
}

export function usePlaybackState() {
  return usePlaybackSessionSelector((store) => store.state);
}

export function usePlaybackSongActions() {
  const addToQueue = usePlaybackSessionSelector((store) => store.addToQueue);
  const playSong = usePlaybackSessionSelector((store) => store.playSong);

  return useMemo(
    () => ({
      addToQueue,
      playSong,
    }),
    [addToQueue, playSong],
  );
}

export function usePlaybackToggleActions() {
  const pause = usePlaybackSessionSelector((store) => store.pause);
  const resume = usePlaybackSessionSelector((store) => store.resume);

  return useMemo(
    () => ({
      pause,
      resume,
    }),
    [pause, resume],
  );
}

export function usePlaybackRemoveFromQueue() {
  return usePlaybackSessionSelector((store) => store.removeFromQueue);
}

export function usePlaybackResetSession() {
  return usePlaybackSessionSelector((store) => store.resetPlaybackSession);
}

import { useCallback } from "react";
import { getResetPlaybackCommandPlan } from "../services/playback-command-plan-service";
import { clearPersistedPlaybackState } from "../services/playback-persistence-service";
import type { PlaybackRunCommandPlan } from "./use-playback-command-runners";

export function usePlaybackResetCommand({
  runCommandPlan,
}: {
  runCommandPlan: PlaybackRunCommandPlan;
}) {
  return useCallback(() => {
    void clearPersistedPlaybackState();
    runCommandPlan(getResetPlaybackCommandPlan());
  }, [runCommandPlan]);
}

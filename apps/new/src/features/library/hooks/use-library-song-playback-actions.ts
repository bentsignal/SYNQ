import { useCallback, useMemo } from "react";
import { router } from "expo-router";
import { usePlaybackSessionSelector } from "@/src/features/playback/hooks/use-playback-session";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import {
  getLibrarySongDetailPlayerHref,
  toLibrarySongDetailPlaybackItem,
} from "../services/library-song-interaction-service";

type UseLibrarySongPlaybackActionsParams = {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  songId: number;
};

export function useLibrarySongPlaybackActions({
  actionState,
  detail,
  songId,
}: UseLibrarySongPlaybackActionsParams) {
  const addToQueue = usePlaybackSessionSelector((store) => store.addToQueue);
  const playSong = usePlaybackSessionSelector((store) => store.playSong);
  const { sendHaptic } = useHapticFeedback();
  const playbackItem = useMemo(
    () => toLibrarySongDetailPlaybackItem({ detail, songId }),
    [detail, songId],
  );

  const playCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    playSong(playbackItem);
    router.push(getLibrarySongDetailPlayerHref());
  }, [actionState.canPlay, playSong, playbackItem, sendHaptic]);

  const queueCurrentSong = useCallback(() => {
    if (!actionState.canPlay) {
      sendHaptic("error");
      return;
    }

    sendHaptic("light");
    addToQueue(playbackItem);
  }, [actionState.canPlay, addToQueue, playbackItem, sendHaptic]);

  return {
    playCurrentSong,
    queueCurrentSong,
  };
}

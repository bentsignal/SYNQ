import { useCallback, useMemo } from "react";
import { pushNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { usePlaybackSongActions } from "@/src/features/playback/hooks/use-playback-session-selectors";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import {
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import {
  runLibrarySongPlayAction,
  runLibrarySongQueueAction,
} from "../services/library-song-playback-action-flow-service";
import {
  toLibrarySongDetailPlaybackItem,
} from "../services/library-song-playback-state-service";

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
  const { addToQueue, playSong } = usePlaybackSongActions();
  const { sendHaptic } = useHapticFeedback();
  const playbackItem = useMemo(
    () => toLibrarySongDetailPlaybackItem({ detail, songId }),
    [detail, songId],
  );

  const playCurrentSong = useCallback(() => {
    runLibrarySongPlayAction({
      canPlay: actionState.canPlay,
      playbackItem,
      playSong,
      pushRoute: pushNativeRoute,
      sendHaptic,
    });
  }, [actionState.canPlay, playSong, playbackItem, sendHaptic]);

  const queueCurrentSong = useCallback(() => {
    runLibrarySongQueueAction({
      addToQueue,
      canPlay: actionState.canPlay,
      playbackItem,
      sendHaptic,
    });
  }, [actionState.canPlay, addToQueue, playbackItem, sendHaptic]);

  return {
    playCurrentSong,
    queueCurrentSong,
  };
}

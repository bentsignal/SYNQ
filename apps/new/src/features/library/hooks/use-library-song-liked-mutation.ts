import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { setLibrarySongLiked } from "../repository/library-song-liked-repository";
import {
  type LibrarySongDetail,
} from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import {
  getLibrarySongDetailMutationErrorMessage,
  type LibrarySongDetailMutationAction,
} from "../services/library-song-detail-mutation-service";

type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

type UseLibrarySongLikedMutationParams = {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  dispatchMutation: LibrarySongDetailMutationDispatch;
  songId: number;
};

export function useLibrarySongLikedMutation({
  actionState,
  detail,
  dispatchMutation,
  songId,
}: UseLibrarySongLikedMutationParams) {
  const { sendHaptic } = useHapticFeedback();

  return useCallback(async () => {
    if (!actionState.canToggleLiked) {
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "toggle-liked", type: "begin" });

    try {
      await setLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic("light");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "toggle-liked",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "toggle-liked", type: "finish" });
    }
  }, [
    actionState.canToggleLiked,
    detail.isLiked,
    dispatchMutation,
    sendHaptic,
    songId,
  ]);
}

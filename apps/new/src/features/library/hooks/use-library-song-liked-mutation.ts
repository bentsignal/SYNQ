import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { toggleLibrarySongLikedCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import { runLibrarySongLikedCommand } from "../services/library-song-detail-mutation-command-flow-service";
import type { LibrarySongDetailMutationAction } from "../services/library-song-detail-mutation-service";

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
    await runLibrarySongLikedCommand({
      actionState,
      detail,
      dispatch: dispatchMutation,
      sendHaptic,
      songId,
      toggleLibrarySongLiked: toggleLibrarySongLikedCommand,
    });
  }, [
    actionState,
    detail,
    dispatchMutation,
    sendHaptic,
    songId,
  ]);
}

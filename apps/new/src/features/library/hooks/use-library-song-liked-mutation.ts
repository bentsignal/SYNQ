import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { toggleLibrarySongLikedCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import {
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
  getLibrarySongLikedSuccessCommand,
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
      const command = getLibrarySongDetailMutationBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    dispatchMutation(
      getLibrarySongDetailMutationStartCommand("toggle-liked").action,
    );

    try {
      await toggleLibrarySongLikedCommand({
        liked: !detail.isLiked,
        songId,
      });
      sendHaptic(getLibrarySongLikedSuccessCommand().haptic);
    } catch (caughtError) {
      const command = getLibrarySongDetailMutationFailureCommand({
        caughtError,
        mutation: "toggle-liked",
      });
      sendHaptic(command.haptic);
      dispatchMutation(command.action);
    } finally {
      dispatchMutation(
        getLibrarySongDetailMutationFinishCommand("toggle-liked").action,
      );
    }
  }, [
    actionState.canToggleLiked,
    detail.isLiked,
    dispatchMutation,
    sendHaptic,
    songId,
  ]);
}

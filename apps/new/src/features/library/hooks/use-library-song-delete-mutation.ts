import { useCallback } from "react";
import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import { runLibrarySongDeleteCommand } from "../services/library-song-detail-mutation-command-flow-service";
import type { LibrarySongDetailMutationAction } from "../services/library-song-detail-mutation-service";

type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

type UseLibrarySongDeleteMutationParams = {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  dispatchMutation: LibrarySongDetailMutationDispatch;
  removeFromQueue: (songId: number) => void;
  songId: number;
};

export function useLibrarySongDeleteMutation({
  actionState,
  detail,
  dispatchMutation,
  removeFromQueue,
  songId,
}: UseLibrarySongDeleteMutationParams) {
  const { sendHaptic } = useHapticFeedback();

  return useCallback(() => {
    runLibrarySongDeleteCommand({
      actionState,
      deleteLibrarySong: deleteLibrarySongCommand,
      detail,
      dispatch: dispatchMutation,
      removeFromQueue,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
      showConfirmation: showNativeConfirmationAlert,
      songId,
    });
  }, [
    actionState,
    detail,
    dispatchMutation,
    removeFromQueue,
    sendHaptic,
    songId,
  ]);
}

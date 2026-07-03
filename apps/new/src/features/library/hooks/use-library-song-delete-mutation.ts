import { useCallback } from "react";
import { router } from "expo-router";
import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { deleteLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import { getLibrarySongDeleteConfirmationCopy } from "../services/library-song-interaction-service";
import {
  getLibrarySongDeleteSuccessCommand,
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
  type LibrarySongDetailMutationAction,
} from "../services/library-song-detail-mutation-service";

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
    if (!actionState.canDelete) {
      const command = getLibrarySongDetailMutationBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    const confirmation = getLibrarySongDeleteConfirmationCopy(detail);

    showNativeConfirmationAlert({
      body: confirmation.body,
      cancelLabel: confirmation.cancelLabel,
      confirmLabel: confirmation.confirmLabel,
      onConfirm: async () => {
        dispatchMutation(
          getLibrarySongDetailMutationStartCommand("delete-song").action,
        );

        try {
          await deleteLibrarySongCommand(songId);
          removeFromQueue(songId);
          const command = getLibrarySongDeleteSuccessCommand();
          sendHaptic(command.haptic);
          router.replace(command.href);
        } catch (caughtError) {
          const command = getLibrarySongDetailMutationFailureCommand({
            caughtError,
            mutation: "delete-song",
          });
          sendHaptic(command.haptic);
          dispatchMutation(command.action);
        } finally {
          dispatchMutation(
            getLibrarySongDetailMutationFinishCommand("delete-song").action,
          );
        }
      },
      title: confirmation.title,
    });
  }, [
    actionState.canDelete,
    detail,
    dispatchMutation,
    removeFromQueue,
    sendHaptic,
    songId,
  ]);
}

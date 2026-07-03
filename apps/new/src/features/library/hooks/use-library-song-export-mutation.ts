import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { exportLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import {
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
  getLibrarySongExportSuccessCommand,
  type LibrarySongDetailMutationAction,
} from "../services/library-song-detail-mutation-service";

type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

type UseLibrarySongExportMutationParams = {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  dispatchMutation: LibrarySongDetailMutationDispatch;
  songId: number;
};

export function useLibrarySongExportMutation({
  actionState,
  detail,
  dispatchMutation,
  songId,
}: UseLibrarySongExportMutationParams) {
  const { sendHaptic } = useHapticFeedback();

  return useCallback(async () => {
    if (!actionState.canExport) {
      const command = getLibrarySongDetailMutationBlockedCommand();
      sendHaptic(command.haptic);
      return;
    }

    dispatchMutation(
      getLibrarySongDetailMutationStartCommand("export-song").action,
    );

    try {
      await exportLibrarySongCommand({ detail, songId });
      sendHaptic(getLibrarySongExportSuccessCommand().haptic);
    } catch (caughtError) {
      const command = getLibrarySongDetailMutationFailureCommand({
        caughtError,
        mutation: "export-song",
      });
      sendHaptic(command.haptic);
      dispatchMutation(command.action);
    } finally {
      dispatchMutation(
        getLibrarySongDetailMutationFinishCommand("export-song").action,
      );
    }
  }, [actionState.canExport, detail, dispatchMutation, sendHaptic, songId]);
}

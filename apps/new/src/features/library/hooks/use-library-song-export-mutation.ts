import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { exportLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import {
  getLibrarySongDetailMutationErrorMessage,
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
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "export-song", type: "begin" });

    try {
      await exportLibrarySongCommand({ detail, songId });
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getLibrarySongDetailMutationErrorMessage({
          caughtError,
          mutation: "export-song",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "export-song", type: "finish" });
    }
  }, [actionState.canExport, detail, dispatchMutation, sendHaptic, songId]);
}

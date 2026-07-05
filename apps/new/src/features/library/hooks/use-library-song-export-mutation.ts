import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { exportLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-types-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-action-state-service";
import { runLibrarySongExportCommand } from "../services/library-song-export-command-flow-service";
import type { LibrarySongDetailMutationDispatch } from "../services/library-song-detail-mutation-runtime-service";

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
    await runLibrarySongExportCommand({
      actionState,
      detail,
      dispatch: dispatchMutation,
      exportLibrarySong: exportLibrarySongCommand,
      sendHaptic,
      songId,
    });
  }, [actionState, detail, dispatchMutation, sendHaptic, songId]);
}

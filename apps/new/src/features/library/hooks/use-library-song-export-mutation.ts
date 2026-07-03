import { useCallback } from "react";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { exportLibrarySongCommand } from "../services/library-song-command-service";
import { type LibrarySongDetail } from "../services/library-song-detail-service";
import type { LibrarySongDetailActionState } from "../services/library-song-detail-state-service";
import { runLibrarySongExportCommand } from "../services/library-song-detail-mutation-command-flow-service";
import type { LibrarySongDetailMutationAction } from "../services/library-song-detail-mutation-service";

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

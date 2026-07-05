import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";
import {
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongExportSuccessCommand,
} from "./library-song-detail-mutation-command-state-service";
import {
  runLibrarySongDetailMutationAttempt,
  type LibrarySongDetailMutationDispatch,
  type LibrarySongDetailMutationHapticSender,
} from "./library-song-detail-mutation-runtime-service";
import type { LibrarySongDetail } from "./library-song-detail-types-service";

export const runLibrarySongExportCommand = async ({
  actionState,
  detail,
  dispatch,
  exportLibrarySong,
  sendHaptic,
  songId,
}: {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  dispatch: LibrarySongDetailMutationDispatch;
  exportLibrarySong: (params: {
    detail: LibrarySongDetail;
    songId: number;
  }) => Promise<unknown>;
  sendHaptic: LibrarySongDetailMutationHapticSender;
  songId: number;
}) => {
  if (!actionState.canExport) {
    sendHaptic(getLibrarySongDetailMutationBlockedCommand().haptic);
    return;
  }

  await runLibrarySongDetailMutationAttempt({
    dispatch,
    mutation: "export-song",
    onSuccess: () => {
      sendHaptic(getLibrarySongExportSuccessCommand().haptic);
    },
    run: () => exportLibrarySong({ detail, songId }),
    sendHaptic,
  });
};

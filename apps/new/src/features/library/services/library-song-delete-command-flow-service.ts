import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";
import {
  getLibrarySongDeleteSuccessCommand,
  getLibrarySongDetailMutationBlockedCommand,
} from "./library-song-detail-mutation-command-state-service";
import {
  runLibrarySongDetailMutationAttempt,
  type LibrarySongDetailMutationDispatch,
  type LibrarySongDetailMutationHapticSender,
  type NativeSongDeleteConfirmationPresenter,
  type NativeSongDetailRouteReplacer,
} from "./library-song-detail-mutation-runtime-service";
import type { LibrarySongDetail } from "./library-song-detail-types-service";
import { getLibrarySongDeleteConfirmationCopy } from "./library-song-delete-confirmation-service";

export const runLibrarySongDeleteCommand = ({
  actionState,
  deleteLibrarySong,
  detail,
  dispatch,
  removeFromQueue,
  replaceRoute,
  sendHaptic,
  showConfirmation,
  songId,
}: {
  actionState: LibrarySongDetailActionState;
  deleteLibrarySong: (songId: number) => Promise<void>;
  detail: LibrarySongDetail;
  dispatch: LibrarySongDetailMutationDispatch;
  removeFromQueue: (songId: number) => void;
  replaceRoute: NativeSongDetailRouteReplacer;
  sendHaptic: LibrarySongDetailMutationHapticSender;
  showConfirmation: NativeSongDeleteConfirmationPresenter;
  songId: number;
}) => {
  if (!actionState.canDelete) {
    sendHaptic(getLibrarySongDetailMutationBlockedCommand().haptic);
    return;
  }

  const confirmation = getLibrarySongDeleteConfirmationCopy(detail);

  showConfirmation({
    body: confirmation.body,
    cancelLabel: confirmation.cancelLabel,
    confirmLabel: confirmation.confirmLabel,
    onConfirm: async () => {
      await runLibrarySongDetailMutationAttempt({
        dispatch,
        mutation: "delete-song",
        onSuccess: () => {
          removeFromQueue(songId);
          const command = getLibrarySongDeleteSuccessCommand();
          sendHaptic(command.haptic);
          replaceRoute(command.href);
        },
        run: () => deleteLibrarySong(songId),
        sendHaptic,
      });
    },
    title: confirmation.title,
  });
};

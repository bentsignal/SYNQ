import type { LibrarySongDetail } from "./library-song-detail-service";
import {
  getLibrarySongDeleteConfirmationCopy,
} from "./library-song-delete-confirmation-service";
import {
  getLibrarySongDeleteSuccessCommand,
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongExportSuccessCommand,
  getLibrarySongLikedSuccessCommand,
} from "./library-song-detail-mutation-command-state-service";
import {
  runLibrarySongDetailMutationAttempt,
  type LibrarySongDetailMutationDispatch,
  type LibrarySongDetailMutationHapticSender,
  type NativeSongDeleteConfirmationPresenter,
  type NativeSongDetailRouteReplacer,
} from "./library-song-detail-mutation-runtime-service";
import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";

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

export const runLibrarySongLikedCommand = async ({
  actionState,
  detail,
  dispatch,
  sendHaptic,
  songId,
  toggleLibrarySongLiked,
}: {
  actionState: LibrarySongDetailActionState;
  detail: Pick<LibrarySongDetail, "isLiked">;
  dispatch: LibrarySongDetailMutationDispatch;
  sendHaptic: LibrarySongDetailMutationHapticSender;
  songId: number;
  toggleLibrarySongLiked: (params: {
    liked: boolean;
    songId: number;
  }) => Promise<unknown>;
}) => {
  if (!actionState.canToggleLiked) {
    sendHaptic(getLibrarySongDetailMutationBlockedCommand().haptic);
    return;
  }

  await runLibrarySongDetailMutationAttempt({
    dispatch,
    mutation: "toggle-liked",
    onSuccess: () => {
      sendHaptic(getLibrarySongLikedSuccessCommand().haptic);
    },
    run: () =>
      toggleLibrarySongLiked({
        liked: !detail.isLiked,
        songId,
      }),
    sendHaptic,
  });
};

import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { LibrarySongDetail } from "./library-song-detail-service";
import {
  getLibrarySongDeleteConfirmationCopy,
  type LibrarySongDetailHref,
} from "./library-song-interaction-service";
import {
  getLibrarySongDeleteSuccessCommand,
  getLibrarySongDetailMutationBlockedCommand,
  getLibrarySongDetailMutationFailureCommand,
  getLibrarySongDetailMutationFinishCommand,
  getLibrarySongDetailMutationStartCommand,
  getLibrarySongExportSuccessCommand,
  getLibrarySongLikedSuccessCommand,
} from "./library-song-detail-mutation-command-state-service";
import type {
  LibrarySongDetailMutationAction,
  LibrarySongDetailMutationKind,
} from "./library-song-detail-mutation-service";
import type { LibrarySongDetailActionState } from "./library-song-detail-state-service";

type LibrarySongDetailMutationDispatch = (
  action: LibrarySongDetailMutationAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type NativeConfirmationPresenter = (params: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  title: string;
}) => void;

type NativeRouteReplacer = (href: LibrarySongDetailHref) => void;

const runLibrarySongDetailMutationAttempt = async ({
  dispatch,
  mutation,
  onSuccess,
  run,
  sendHaptic,
}: {
  dispatch: LibrarySongDetailMutationDispatch;
  mutation: LibrarySongDetailMutationKind;
  onSuccess: () => void;
  run: () => Promise<unknown>;
  sendHaptic: HapticSender;
}) => {
  dispatch(getLibrarySongDetailMutationStartCommand(mutation).action);

  try {
    await run();
    onSuccess();
  } catch (caughtError) {
    const command = getLibrarySongDetailMutationFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getLibrarySongDetailMutationFinishCommand(mutation).action);
  }
};

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
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
  showConfirmation: NativeConfirmationPresenter;
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
  sendHaptic: HapticSender;
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
  sendHaptic: HapticSender;
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

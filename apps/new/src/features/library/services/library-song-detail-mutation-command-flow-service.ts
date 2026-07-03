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
import type { LibrarySongDetailMutationAction } from "./library-song-detail-mutation-service";
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
      dispatch(getLibrarySongDetailMutationStartCommand("delete-song").action);

      try {
        await deleteLibrarySong(songId);
        removeFromQueue(songId);
        const command = getLibrarySongDeleteSuccessCommand();
        sendHaptic(command.haptic);
        replaceRoute(command.href);
      } catch (caughtError) {
        const command = getLibrarySongDetailMutationFailureCommand({
          caughtError,
          mutation: "delete-song",
        });
        sendHaptic(command.haptic);
        dispatch(command.action);
      } finally {
        dispatch(getLibrarySongDetailMutationFinishCommand("delete-song").action);
      }
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

  dispatch(getLibrarySongDetailMutationStartCommand("export-song").action);

  try {
    await exportLibrarySong({ detail, songId });
    sendHaptic(getLibrarySongExportSuccessCommand().haptic);
  } catch (caughtError) {
    const command = getLibrarySongDetailMutationFailureCommand({
      caughtError,
      mutation: "export-song",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getLibrarySongDetailMutationFinishCommand("export-song").action);
  }
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

  dispatch(getLibrarySongDetailMutationStartCommand("toggle-liked").action);

  try {
    await toggleLibrarySongLiked({
      liked: !detail.isLiked,
      songId,
    });
    sendHaptic(getLibrarySongLikedSuccessCommand().haptic);
  } catch (caughtError) {
    const command = getLibrarySongDetailMutationFailureCommand({
      caughtError,
      mutation: "toggle-liked",
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(getLibrarySongDetailMutationFinishCommand("toggle-liked").action);
  }
};

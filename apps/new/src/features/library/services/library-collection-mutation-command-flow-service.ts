import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { CollectionDetailActionState } from "./library-collection-action-state-service";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailSong,
} from "./library-collection-detail-service";
import { getDeleteCollectionConfirmationCopy } from "./library-collection-interaction-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionDeleteFinishCommand,
  getCollectionDeleteStartCommand,
  getCollectionDeleteSuccessCommand,
  getCollectionDetailMutationBlockedCommand,
  getCollectionDetailMutationFailureCommand,
  getCollectionExportFinishCommand,
  getCollectionExportStartCommand,
  getCollectionExportSuccessCommand,
  getCollectionSongMoveFinishCommand,
  getCollectionSongMoveStartCommand,
  getCollectionSongMoveSuccessCommand,
  getCollectionSongRemovalFinishCommand,
  getCollectionSongRemovalStartCommand,
  getCollectionSongRemovalSuccessCommand,
} from "./library-collection-mutation-service";
import type {
  CollectionDetailMutationAction,
  CollectionDetailMutationKind,
} from "./library-collection-mutation-state-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

type NativeConfirmationPresenter = (params: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  title: string;
}) => void;

type NativeRouteReplacer = (href: string) => void;

const runCollectionDetailMutationAttempt = async ({
  dispatch,
  finishAction,
  mutation,
  onSuccess,
  run,
  sendHaptic,
  startAction,
}: {
  dispatch: CollectionDetailMutationDispatch;
  finishAction: CollectionDetailMutationAction;
  mutation: CollectionDetailMutationKind;
  onSuccess: () => void;
  run: () => Promise<void>;
  sendHaptic: HapticSender;
  startAction: CollectionDetailMutationAction;
}) => {
  dispatch(startAction);

  try {
    await run();
    onSuccess();
  } catch (caughtError) {
    const command = getCollectionDetailMutationFailureCommand({
      caughtError,
      mutation,
    });
    sendHaptic(command.haptic);
    dispatch(command.action);
  } finally {
    dispatch(finishAction);
  }
};

export const runLibraryCollectionDeleteCommand = ({
  actionState,
  deleteLibraryCollection,
  detail,
  dispatch,
  id,
  kind,
  replaceRoute,
  sendHaptic,
  showConfirmation,
}: {
  actionState: CollectionDetailActionState;
  deleteLibraryCollection: (params: {
    id: number;
    kind: LibraryCollectionDetailKind;
  }) => Promise<void>;
  detail: Pick<LibraryCollectionDetail, "eyebrow" | "title">;
  dispatch: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
  replaceRoute: NativeRouteReplacer;
  sendHaptic: HapticSender;
  showConfirmation: NativeConfirmationPresenter;
}) => {
  if (!actionState.canDelete) {
    sendHaptic(getCollectionDetailMutationBlockedCommand().haptic);
    return;
  }

  const confirmationCopy = getDeleteCollectionConfirmationCopy({
    eyebrow: detail.eyebrow,
    title: detail.title,
  });

  showConfirmation({
    body: confirmationCopy.message,
    cancelLabel: confirmationCopy.cancelLabel,
    confirmLabel: confirmationCopy.confirmLabel,
    onConfirm: async () => {
      await runCollectionDetailMutationAttempt({
        dispatch,
        finishAction: getCollectionDeleteFinishCommand().action,
        mutation: "delete-collection",
        onSuccess: () => {
          const command = getCollectionDeleteSuccessCommand({ kind });
          sendHaptic(command.haptic);
          replaceRoute(command.href);
        },
        run: () => deleteLibraryCollection({ id, kind }),
        sendHaptic,
        startAction: getCollectionDeleteStartCommand().action,
      });
    },
    title: confirmationCopy.title,
  });
};

export const runLibraryCollectionExportCommand = async ({
  actionState,
  dispatch,
  exportLibraryCollection,
  sendHaptic,
}: {
  actionState: CollectionDetailActionState;
  dispatch: CollectionDetailMutationDispatch;
  exportLibraryCollection: (
    songs: CollectionDetailActionState["playableSongs"],
  ) => Promise<unknown>;
  sendHaptic: HapticSender;
}) => {
  if (!actionState.canExport) {
    sendHaptic(getCollectionDetailMutationBlockedCommand().haptic);
    return;
  }

  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionExportFinishCommand().action,
    mutation: "export-collection",
    onSuccess: () => {
      sendHaptic(getCollectionExportSuccessCommand().haptic);
    },
    run: async () => {
      await exportLibraryCollection(actionState.playableSongs);
    },
    sendHaptic,
    startAction: getCollectionExportStartCommand().action,
  });
};

export const runLibraryCollectionSongMoveCommand = async ({
  collectionId,
  detail,
  direction,
  dispatch,
  kind,
  moveLibraryCollectionSong,
  sendHaptic,
  songId,
}: {
  collectionId: number;
  detail: Pick<LibraryCollectionDetail, "songs">;
  direction: "down" | "up";
  dispatch: CollectionDetailMutationDispatch;
  kind: LibraryCollectionDetailKind;
  moveLibraryCollectionSong: (params: {
    collectionId: number;
    direction: "down" | "up";
    kind: LibraryCollectionDetailKind;
    songId: number;
    songs: LibraryCollectionDetailSong[];
  }) => Promise<void>;
  sendHaptic: HapticSender;
  songId: number;
}) => {
  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionSongMoveFinishCommand().action,
    mutation: "move-song",
    onSuccess: () => {
      sendHaptic(getCollectionSongMoveSuccessCommand().haptic);
    },
    run: () =>
      moveLibraryCollectionSong({
        collectionId,
        direction,
        kind,
        songId,
        songs: detail.songs,
      }),
    sendHaptic,
    startAction: getCollectionSongMoveStartCommand(songId).action,
  });
};

export const runLibraryCollectionSongRemoveCommand = async ({
  collectionId,
  dispatch,
  kind,
  removeLibraryCollectionSong,
  sendHaptic,
  songId,
}: {
  collectionId: number;
  dispatch: CollectionDetailMutationDispatch;
  kind: LibraryCollectionDetailKind;
  removeLibraryCollectionSong: (params: {
    collectionId: number;
    kind: LibraryCollectionDetailKind;
    songId: number;
  }) => Promise<void>;
  sendHaptic: HapticSender;
  songId: number;
}) => {
  await runCollectionDetailMutationAttempt({
    dispatch,
    finishAction: getCollectionSongRemovalFinishCommand().action,
    mutation: "remove-song",
    onSuccess: () => {
      sendHaptic(getCollectionSongRemovalSuccessCommand().haptic);
    },
    run: () =>
      removeLibraryCollectionSong({
        collectionId,
        kind,
        songId,
      }),
    sendHaptic,
    startAction: getCollectionSongRemovalStartCommand(songId).action,
  });
};

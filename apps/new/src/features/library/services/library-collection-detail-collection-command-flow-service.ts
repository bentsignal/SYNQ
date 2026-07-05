import type { CollectionDetailActionState } from "./library-collection-action-state-service";
import type { LibraryCollectionDetail } from "./library-collection-detail-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
  type NativeConfirmationPresenter,
  type NativeRouteReplacer,
} from "./library-collection-detail-mutation-runtime-service";
import { getDeleteCollectionConfirmationCopy } from "./library-collection-delete-confirmation-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionDeleteFinishCommand,
  getCollectionDeleteStartCommand,
  getCollectionDeleteSuccessCommand,
  getCollectionDetailMutationBlockedCommand,
  getCollectionExportFinishCommand,
  getCollectionExportStartCommand,
  getCollectionExportSuccessCommand,
} from "./library-collection-mutation-service";

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
  sendHaptic: CollectionDetailMutationHapticSender;
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
  sendHaptic: CollectionDetailMutationHapticSender;
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

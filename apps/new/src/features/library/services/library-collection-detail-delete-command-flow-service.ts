import type { CollectionDetailActionState } from "./library-collection-detail-action-state-service";
import type { LibraryCollectionDetail } from "./library-collection-detail-service";
import type {
  DeleteLibraryCollectionCommandParams,
} from "./library-collection-command-dependencies-service";
import {
  runCollectionDetailMutationAttempt,
  type CollectionDetailMutationDispatch,
  type CollectionDetailMutationHapticSender,
  type NativeConfirmationPresenter,
  type NativeRouteReplacer,
} from "./library-collection-detail-mutation-runtime-service";
import { getDeleteCollectionConfirmationCopy } from "./library-collection-delete-confirmation-service";
import {
  getCollectionDeleteFinishCommand,
  getCollectionDeleteStartCommand,
  getCollectionDeleteSuccessCommand,
} from "./library-collection-mutation-collection-command-service";
import { getCollectionDetailMutationBlockedCommand } from "./library-collection-mutation-common-command-service";

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
  deleteLibraryCollection: (
    params: DeleteLibraryCollectionCommandParams,
  ) => Promise<void>;
  detail: Pick<LibraryCollectionDetail, "eyebrow" | "title">;
  dispatch: CollectionDetailMutationDispatch;
  id: DeleteLibraryCollectionCommandParams["id"];
  kind: DeleteLibraryCollectionCommandParams["kind"];
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

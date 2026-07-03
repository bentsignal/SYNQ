import { router } from "expo-router";
import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { deleteLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getDeleteCollectionConfirmationCopy,
  type CollectionDetailActionState,
} from "../services/library-collection-interaction-service";
import {
  getCollectionDeleteFinishCommand,
  getCollectionDeleteStartCommand,
  getCollectionDeleteSuccessCommand,
  getCollectionDetailMutationBlockedCommand,
  getCollectionDetailMutationFailureCommand,
  type CollectionDetailMutationAction,
} from "../services/library-collection-mutation-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

type HapticSender = (type: HapticFeedbackType) => void;

export function useLibraryCollectionDeleteCommand({
  actionState,
  detail,
  dispatchMutation,
  id,
  kind,
  sendHaptic,
}: {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  dispatchMutation: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
  sendHaptic: HapticSender;
}) {
  return () => {
    if (!actionState.canDelete) {
      sendHaptic(getCollectionDetailMutationBlockedCommand().haptic);
      return;
    }

    const confirmationCopy = getDeleteCollectionConfirmationCopy({
      eyebrow: detail.eyebrow,
      title: detail.title,
    });

    showNativeConfirmationAlert({
      body: confirmationCopy.message,
      cancelLabel: confirmationCopy.cancelLabel,
      confirmLabel: confirmationCopy.confirmLabel,
      onConfirm: async () => {
        dispatchMutation(getCollectionDeleteStartCommand().action);

        try {
          await deleteLibraryCollectionCommand({ id, kind });
          const command = getCollectionDeleteSuccessCommand({ kind });
          sendHaptic(command.haptic);
          router.replace(command.href);
        } catch (caughtError) {
          const command = getCollectionDetailMutationFailureCommand({
            caughtError,
            mutation: "delete-collection",
          });
          sendHaptic(command.haptic);
          dispatchMutation(command.action);
        } finally {
          dispatchMutation(getCollectionDeleteFinishCommand().action);
        }
      },
      title: confirmationCopy.title,
    });
  };
}

import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import type { HapticFeedbackType } from "@/src/features/settings/services/haptic-feedback-service";
import { deleteLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import type { CollectionDetailActionState } from "../services/library-collection-action-state-service";
import { runLibraryCollectionDeleteCommand } from "../services/library-collection-mutation-command-flow-service";
import type { CollectionDetailMutationAction } from "../services/library-collection-mutation-state-service";

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
  return () =>
    runLibraryCollectionDeleteCommand({
      actionState,
      deleteLibraryCollection: deleteLibraryCollectionCommand,
      detail,
      dispatch: dispatchMutation,
      id,
      kind,
      replaceRoute: replaceNativeRoute,
      sendHaptic,
      showConfirmation: showNativeConfirmationAlert,
    });
}

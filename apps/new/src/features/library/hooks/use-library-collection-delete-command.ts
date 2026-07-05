import { showNativeConfirmationAlert } from "@/src/features/app-shell/services/native-alert-service";
import { replaceNativeRoute } from "@/src/features/app-shell/services/native-route-service";
import { deleteLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import type { CollectionDetailActionState } from "../services/library-collection-detail-action-state-service";
import type {
  CollectionDetailMutationDispatch,
  CollectionDetailMutationHapticSender,
} from "../services/library-collection-detail-mutation-runtime-service";
import { runLibraryCollectionDeleteCommand } from "../services/library-collection-detail-collection-command-flow-service";

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
  sendHaptic: CollectionDetailMutationHapticSender;
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

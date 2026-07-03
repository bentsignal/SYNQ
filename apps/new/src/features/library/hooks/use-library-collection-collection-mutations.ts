import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useLibraryCollectionDeleteCommand } from "./use-library-collection-delete-command";
import { exportLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import type { CollectionDetailActionState } from "../services/library-collection-action-state-service";
import type { CollectionDetailMutationDispatch } from "../services/library-collection-detail-mutation-runtime-service";
import { runLibraryCollectionExportCommand } from "../services/library-collection-mutation-command-flow-service";

type UseLibraryCollectionCollectionMutationsParams = {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  dispatchMutation: CollectionDetailMutationDispatch;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionCollectionMutations({
  actionState,
  detail,
  dispatchMutation,
  id,
  kind,
}: UseLibraryCollectionCollectionMutationsParams) {
  const { sendHaptic } = useHapticFeedback();

  const exportCollection = async () => {
    await runLibraryCollectionExportCommand({
      actionState,
      dispatch: dispatchMutation,
      exportLibraryCollection: exportLibraryCollectionCommand,
      sendHaptic,
    });
  };

  const deleteCurrentCollection = useLibraryCollectionDeleteCommand({
    actionState,
    detail,
    dispatchMutation,
    id,
    kind,
    sendHaptic,
  });

  return {
    deleteCurrentCollection,
    exportCollection,
  };
}

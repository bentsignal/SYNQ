import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useLibraryCollectionDeleteCommand } from "./use-library-collection-delete-command";
import { exportLibraryCollectionCommand } from "../services/library-collection-command-service";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  type CollectionDetailActionState,
} from "../services/library-collection-interaction-service";
import {
  getCollectionDetailMutationErrorMessage,
  type CollectionDetailMutationAction,
} from "../services/library-collection-mutation-service";

type CollectionDetailMutationDispatch = (
  action: CollectionDetailMutationAction,
) => void;

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
    if (!actionState.canExport) {
      sendHaptic("error");
      return;
    }

    dispatchMutation({ mutation: "export-collection", type: "begin" });

    try {
      await exportLibraryCollectionCommand(actionState.playableSongs);
      sendHaptic("success");
    } catch (caughtError) {
      sendHaptic("error");
      dispatchMutation({
        error: getCollectionDetailMutationErrorMessage({
          caughtError,
          mutation: "export-collection",
        }),
        type: "fail",
      });
    } finally {
      dispatchMutation({ mutation: "export-collection", type: "finish" });
    }
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

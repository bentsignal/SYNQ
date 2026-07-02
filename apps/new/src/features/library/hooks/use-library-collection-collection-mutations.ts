import { shareLibrarySongs } from "@/src/features/export/services/library-export-service";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import { useLibraryCollectionDeleteCommand } from "./use-library-collection-delete-command";
import type {
  LibraryCollectionDetail,
  LibraryCollectionDetailKind,
} from "../services/library-collection-detail-service";
import {
  getCollectionDetailMutationErrorMessage,
  type CollectionDetailActionState,
  type CollectionDetailMutationAction,
} from "../services/library-collection-interaction-service";

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
      await shareLibrarySongs(actionState.playableSongs);
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

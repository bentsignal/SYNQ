import { useMemo, useReducer } from "react";
import { useLibraryCollectionCollectionMutations } from "./use-library-collection-collection-mutations";
import { useLibraryCollectionSongMutations } from "./use-library-collection-song-mutations";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionDetailActionState,
} from "../services/library-collection-action-state-service";
import {
  collectionDetailMutationReducer,
  initialCollectionDetailMutationState,
} from "../services/library-collection-mutation-service";

type UseLibraryCollectionDetailMutationsParams = {
  detail: LibraryCollectionDetail;
  id: number;
  kind: LibraryCollectionDetailKind;
};

export function useLibraryCollectionDetailMutations({
  detail,
  id,
  kind,
}: UseLibraryCollectionDetailMutationsParams) {
  const [mutationState, dispatchMutation] = useReducer(
    collectionDetailMutationReducer,
    initialCollectionDetailMutationState,
  );
  const actionState = useMemo(
    () =>
      getCollectionDetailActionState({
        id,
        isDeleting: mutationState.isDeleting,
        isExporting: mutationState.isExporting,
        isMissing: detail.isMissing,
        kind,
        songs: detail.songs,
      }),
    [
      detail.isMissing,
      detail.songs,
      id,
      kind,
      mutationState.isDeleting,
      mutationState.isExporting,
    ],
  );
  const collectionMutations = useLibraryCollectionCollectionMutations({
    actionState,
    detail,
    dispatchMutation,
    id,
    kind,
  });
  const songMutations = useLibraryCollectionSongMutations({
    detail,
    dispatchMutation,
    id,
    kind,
  });

  return {
    actionState,
    ...collectionMutations,
    movingSongId: mutationState.movingSongId,
    mutationError: mutationState.mutationError,
    removingSongId: mutationState.removingSongId,
    ...songMutations,
  };
}

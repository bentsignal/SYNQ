import { useReducer } from "react";
import { useLibraryCollectionCollectionMutations } from "./use-library-collection-collection-mutations";
import { useLibraryCollectionSongMutations } from "./use-library-collection-song-mutations";
import type { LibraryCollectionDetail } from "../services/library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "../services/library-collection-kind-service";
import {
  getCollectionDetailMutationControllerState,
} from "../services/library-collection-detail-mutation-controller-state-service";
import {
  collectionDetailMutationReducer,
  initialCollectionDetailMutationState,
} from "../services/library-collection-mutation-state-service";

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
  const controllerState = getCollectionDetailMutationControllerState({
    detail,
    id,
    kind,
    mutationState,
  });
  const collectionMutations = useLibraryCollectionCollectionMutations({
    actionState: controllerState.actionState,
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
    ...controllerState,
    ...collectionMutations,
    ...songMutations,
  };
}

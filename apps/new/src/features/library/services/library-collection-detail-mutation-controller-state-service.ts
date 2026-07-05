import type { LibraryCollectionDetail } from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import type { CollectionDetailMutationState } from "./library-collection-mutation-state-service";
import { getCollectionDetailActionState } from "./library-collection-detail-action-state-service";

export const getCollectionDetailMutationActionState = ({
  detail,
  id,
  kind,
  mutationState,
}: {
  detail: Pick<LibraryCollectionDetail, "isMissing" | "songs">;
  id: number;
  kind: LibraryCollectionDetailKind;
  mutationState: Pick<CollectionDetailMutationState, "isDeleting" | "isExporting">;
}) =>
  getCollectionDetailActionState({
    id,
    isDeleting: mutationState.isDeleting,
    isExporting: mutationState.isExporting,
    isMissing: detail.isMissing,
    kind,
    songs: detail.songs,
  });

export const getCollectionDetailMutationControllerState = ({
  detail,
  id,
  kind,
  mutationState,
}: {
  detail: Pick<LibraryCollectionDetail, "isMissing" | "songs">;
  id: number;
  kind: LibraryCollectionDetailKind;
  mutationState: CollectionDetailMutationState;
}) => ({
  actionState: getCollectionDetailMutationActionState({
    detail,
    id,
    kind,
    mutationState,
  }),
  movingSongId: mutationState.movingSongId,
  mutationError: mutationState.mutationError,
  removingSongId: mutationState.removingSongId,
});

export type CollectionDetailMutationControllerState = ReturnType<
  typeof getCollectionDetailMutationControllerState
>;

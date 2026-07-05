import type { CollectionDetailActionState } from "./library-collection-detail-action-state-service";
import type { LibraryCollectionDetail } from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import { getCollectionSongRowsViewState } from "./library-collection-song-mutation-service";
import { getCollectionDetailStatusState } from "./library-collection-detail-status-state-service";
import { getCollectionDetailViewState } from "./library-collection-detail-view-state-service";

export const getCollectionDetailScreenViewState = ({
  actionState,
  detail,
  errors,
  id,
  kind,
  movingSongId,
  mutationError,
  removingSongId,
}: {
  actionState: CollectionDetailActionState;
  detail: LibraryCollectionDetail;
  errors: readonly unknown[];
  id: number;
  kind: LibraryCollectionDetailKind;
  movingSongId: number | null;
  mutationError: string | null;
  removingSongId: number | null;
}) => ({
  songRows: getCollectionSongRowsViewState({
    canMutateSongs: actionState.canMutateSongs,
    movingSongId,
    removingSongId,
    songs: detail.songs,
  }),
  statusState: getCollectionDetailStatusState({
    errors,
    mutationError,
    updatedAt: detail.updatedAt,
  }),
  viewState: getCollectionDetailViewState({
    id,
    kind,
    songs: detail.songs,
  }),
});

export type CollectionDetailScreenViewState = ReturnType<
  typeof getCollectionDetailScreenViewState
>;

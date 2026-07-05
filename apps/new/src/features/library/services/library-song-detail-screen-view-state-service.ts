import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";
import type { LibrarySongDetail } from "./library-song-detail-service";
import { getLibrarySongDetailStatusState } from "./library-song-detail-status-state-service";
import { getLibrarySongDetailViewState } from "./library-song-detail-view-state-service";

export const getLibrarySongDetailScreenViewState = ({
  actionState,
  detail,
  errors,
  mutationError,
  songId,
}: {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  mutationError: string | null;
  songId: number;
}) => ({
  statusState: getLibrarySongDetailStatusState({
    actionState,
    detail,
    errors,
    mutationError,
  }),
  viewState: getLibrarySongDetailViewState({ detail, songId }),
});

export type LibrarySongDetailScreenViewState = ReturnType<
  typeof getLibrarySongDetailScreenViewState
>;

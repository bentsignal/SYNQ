import type { LibrarySongDetail } from "./library-song-detail-service";
import type { LibrarySongDetailMutationState } from "./library-song-detail-mutation-service";
import { getLibrarySongDetailActionState } from "./library-song-detail-action-state-service";

export const getLibrarySongDetailMutationActionState = ({
  detail,
  mutationState,
}: {
  detail: LibrarySongDetail;
  mutationState: Pick<
    LibrarySongDetailMutationState,
    "isDeleting" | "isExporting" | "isTogglingLiked"
  >;
}) =>
  getLibrarySongDetailActionState({
    detail,
    isDeleting: mutationState.isDeleting,
    isExporting: mutationState.isExporting,
    isTogglingLiked: mutationState.isTogglingLiked,
  });

export const getLibrarySongDetailMutationControllerState = ({
  detail,
  mutationState,
}: {
  detail: LibrarySongDetail;
  mutationState: LibrarySongDetailMutationState;
}) => ({
  actionState: getLibrarySongDetailMutationActionState({
    detail,
    mutationState,
  }),
  error: mutationState.error,
});

export type LibrarySongDetailMutationControllerState = ReturnType<
  typeof getLibrarySongDetailMutationControllerState
>;

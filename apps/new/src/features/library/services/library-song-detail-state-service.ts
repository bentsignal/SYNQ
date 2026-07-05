import type { LibrarySongDetail } from "./library-song-detail-service";
import type { LibrarySongDetailMutationState } from "./library-song-detail-mutation-service";
import { getLibrarySongDetailStatusState } from "./library-song-detail-status-state-service";
import { getLibrarySongDetailViewState } from "./library-song-interaction-service";

export {
  getLibrarySongDetailStatusState,
  getLibrarySongDetailUpdatedLabel,
  type LibrarySongDetailStatusState,
} from "./library-song-detail-status-state-service";

export const getLibrarySongDetailActionState = ({
  detail,
  isDeleting,
  isExporting,
  isTogglingLiked,
}: {
  detail: LibrarySongDetail;
  isDeleting: boolean;
  isExporting: boolean;
  isTogglingLiked: boolean;
}) => {
  const canPlay = !detail.isMissing && detail.pathToFile !== null;

  return {
    canDelete: !detail.isMissing && !isDeleting,
    canExport: canPlay && !isExporting,
    canPlay,
    canToggleLiked: !detail.isMissing && !isTogglingLiked,
    deleteLabel: isDeleting ? "Deleting" : "Delete",
    exportLabel: isExporting ? "Exporting" : "Export",
    likedLabel: detail.isLiked ? "Unlike" : "Like",
  };
};

export type LibrarySongDetailActionState = ReturnType<
  typeof getLibrarySongDetailActionState
>;

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

import type { LibrarySongDetail } from "./library-song-detail-service";
import type { LibrarySongDetailMutationState } from "./library-song-detail-mutation-service";

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

export type LibrarySongDetailStatusState = {
  isError: boolean;
  statusLabel: string;
  updatedLabel: string;
};

export const getLibrarySongDetailStatusState = ({
  actionState,
  detail,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  mutationError,
}: {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  mutationError: string | null;
}): LibrarySongDetailStatusState => {
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${formatUpdatedAt(detail.updatedAt)}`
      : "Waiting for song data";

  if (mutationError !== null) {
    return {
      isError: true,
      statusLabel: mutationError,
      updatedLabel,
    };
  }

  if (errors.length > 0) {
    return {
      isError: true,
      statusLabel: "One or more song detail queries failed.",
      updatedLabel,
    };
  }

  if (detail.isMissing) {
    return {
      isError: false,
      statusLabel: "Song missing from database.",
      updatedLabel,
    };
  }

  if (!actionState.canPlay) {
    return {
      isError: false,
      statusLabel: "Song has no playable file path.",
      updatedLabel,
    };
  }

  return {
    isError: false,
    statusLabel: updatedLabel,
    updatedLabel,
  };
};

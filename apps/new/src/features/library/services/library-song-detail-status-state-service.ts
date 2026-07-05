import type { LibrarySongDetail } from "./library-song-detail-types-service";
import type { LibrarySongDetailActionState } from "./library-song-detail-action-state-service";

export type LibrarySongDetailStatusState = {
  isError: boolean;
  statusLabel: string;
  updatedLabel: string;
};

export const getLibrarySongDetailUpdatedLabel = ({
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  updatedAt,
}: {
  formatUpdatedAt?: (updatedAt: number) => string;
  updatedAt: number;
}) =>
  updatedAt > 0
    ? `Updated ${formatUpdatedAt(updatedAt)}`
    : "Waiting for song data";

export const getLibrarySongDetailStatusState = ({
  actionState,
  detail,
  errors,
  formatUpdatedAt,
  mutationError,
}: {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  mutationError: string | null;
}): LibrarySongDetailStatusState => {
  const updatedLabel = getLibrarySongDetailUpdatedLabel({
    formatUpdatedAt,
    updatedAt: detail.updatedAt,
  });

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

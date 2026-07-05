import type { LibrarySongDetail } from "./library-song-detail-types-service";

export type LibrarySongEditStatusState = {
  isError: boolean;
  statusLabel: string;
};

export const getLibrarySongEditStatusState = ({
  detail,
  errors,
  mutationError,
}: {
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  mutationError: string | null;
}): LibrarySongEditStatusState => {
  if (mutationError !== null) {
    return {
      isError: true,
      statusLabel: mutationError,
    };
  }

  if (errors.length > 0) {
    return {
      isError: true,
      statusLabel: "One or more song edit queries failed.",
    };
  }

  if (detail.isMissing) {
    return {
      isError: false,
      statusLabel: "Song missing from database.",
    };
  }

  return {
    isError: false,
    statusLabel: "Separate multiple artists or albums with commas.",
  };
};

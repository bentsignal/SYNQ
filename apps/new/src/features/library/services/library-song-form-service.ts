import type { LibrarySongDetail } from "./library-song-detail-service";

export type LibrarySongEditFormState = {
  albumNames: string;
  artistNames: string;
  title: string;
};

export const buildLibrarySongEditFormState = (
  detail: LibrarySongDetail,
): LibrarySongEditFormState => ({
  albumNames: detail.albumLabel === "Unknown" ? "" : detail.albumLabel,
  artistNames: detail.artistLabel === "Unknown" ? "" : detail.artistLabel,
  title: detail.isMissing ? "" : detail.title,
});

export const getLibrarySongEditActionState = ({
  detail,
  isSaving,
  title,
}: {
  detail: LibrarySongDetail;
  isSaving: boolean;
  title: string;
}) => ({
  canSave: !detail.isMissing && title.trim().length > 0 && !isSaving,
  saveLabel: isSaving ? "Saving" : "Save",
});

export type LibrarySongEditActionState = ReturnType<
  typeof getLibrarySongEditActionState
>;

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

export const getLibrarySongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be saved.";

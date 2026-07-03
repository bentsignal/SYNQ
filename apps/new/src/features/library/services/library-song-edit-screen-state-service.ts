import type { LibrarySongDetail } from "./library-song-detail-service";

export const getLibrarySongEditFieldState = () =>
  ({
    albumNames: {
      label: "Albums",
      placeholder: "Album names",
      returnKeyType: "done",
    },
    artistNames: {
      label: "Artists",
      placeholder: "Artist names",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
  }) as const;

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

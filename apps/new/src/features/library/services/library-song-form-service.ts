import type { LibrarySongDetail } from "./library-song-detail-service";

export type LibrarySongEditFormState = {
  albumNames: string;
  artistNames: string;
  title: string;
};

export type LibrarySongEditControllerState = LibrarySongEditFormState & {
  errorMessage: string | null;
  isSaving: boolean;
  loadedSongId: number | null;
};

export type LibrarySongEditControllerAction =
  | {
      detail: LibrarySongDetail;
      songId: number;
      type: "hydrate";
    }
  | {
      field: "albumNames" | "artistNames" | "title";
      type: "change-field";
      value: string;
    }
  | {
      type: "begin-save";
    }
  | {
      type: "finish-save";
    }
  | {
      errorMessage: string;
      type: "fail";
    };

export const buildLibrarySongEditFormState = (
  detail: LibrarySongDetail,
): LibrarySongEditFormState => ({
  albumNames: detail.albumLabel === "Unknown" ? "" : detail.albumLabel,
  artistNames: detail.artistLabel === "Unknown" ? "" : detail.artistLabel,
  title: detail.isMissing ? "" : detail.title,
});

export const getInitialLibrarySongEditControllerState =
  (): LibrarySongEditControllerState => ({
    albumNames: "",
    artistNames: "",
    errorMessage: null,
    isSaving: false,
    loadedSongId: null,
    title: "",
  });

export const librarySongEditControllerReducer = (
  state: LibrarySongEditControllerState,
  action: LibrarySongEditControllerAction,
): LibrarySongEditControllerState => {
  switch (action.type) {
    case "hydrate":
      if (action.detail.isMissing || state.loadedSongId === action.songId) {
        return state;
      }

      return {
        ...state,
        ...buildLibrarySongEditFormState(action.detail),
        loadedSongId: action.songId,
      };
    case "change-field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "begin-save":
      return {
        ...state,
        errorMessage: null,
        isSaving: true,
      };
    case "finish-save":
      return {
        ...state,
        isSaving: false,
      };
    case "fail":
      return {
        ...state,
        errorMessage: action.errorMessage,
      };
  }
};

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

export const getLibrarySongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be saved.";

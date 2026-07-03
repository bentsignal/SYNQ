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

export const getLibrarySongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be saved.";

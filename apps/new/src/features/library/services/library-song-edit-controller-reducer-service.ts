import type { LibrarySongDetail } from "./library-song-detail-types-service";
import {
  buildLibrarySongEditFormState,
  type LibrarySongEditFormState,
} from "./library-song-edit-form-state-service";

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
      coverImage: {
        dataUrl: string;
        fileName: string;
      };
      type: "pick-cover-image";
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

export type LibrarySongEditControllerField =
  Extract<LibrarySongEditControllerAction, { type: "change-field" }>["field"];

export const getLibrarySongEditHydrateAction = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}): LibrarySongEditControllerAction => ({
  detail,
  songId,
  type: "hydrate",
});

export const getLibrarySongEditChangeFieldAction = ({
  field,
  value,
}: {
  field: LibrarySongEditControllerField;
  value: string;
}): LibrarySongEditControllerAction => ({
  field,
  type: "change-field",
  value,
});

export const getLibrarySongEditBeginSaveAction =
  (): LibrarySongEditControllerAction => ({
    type: "begin-save",
  });

export const getLibrarySongEditFinishSaveAction =
  (): LibrarySongEditControllerAction => ({
    type: "finish-save",
  });

export const getInitialLibrarySongEditControllerState =
  (): LibrarySongEditControllerState => ({
    albumNames: "",
    artistNames: "",
    coverImage: null,
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
    case "pick-cover-image":
      return {
        ...state,
        coverImage: action.coverImage,
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

export type { LibrarySongEditFormState } from "./library-song-edit-form-state-service";

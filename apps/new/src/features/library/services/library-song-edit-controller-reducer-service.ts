import type { LibrarySongEditControllerAction } from "./library-song-edit-controller-action-service";
import {
  buildLibrarySongEditFormState,
  type LibrarySongEditFormState,
} from "./library-song-edit-form-state-service";

export type LibrarySongEditControllerState = LibrarySongEditFormState & {
  errorMessage: string | null;
  isSaving: boolean;
  loadedSongId: number | null;
};

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

export {
  getLibrarySongEditBeginSaveAction,
  getLibrarySongEditChangeFieldAction,
  getLibrarySongEditFinishSaveAction,
  getLibrarySongEditHydrateAction,
  type LibrarySongEditControllerAction,
  type LibrarySongEditControllerField,
} from "./library-song-edit-controller-action-service";
export type { LibrarySongEditFormState } from "./library-song-edit-form-state-service";

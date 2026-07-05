import {
  removeSongIdSelection,
  toggleSongIdSelection,
} from "./add-collection-songs-selection-mutation-service";
import type { AddCollectionSongsControllerAction } from "./add-collection-songs-action-service";

export type {
  AddCollectionSongsControllerAction,
  AddCollectionSongsMutationKind,
} from "./add-collection-songs-action-service";
export {
  getAddCollectionSongsFinishSelectionAction,
  getAddCollectionSongsFinishSongAction,
} from "./add-collection-songs-action-service";

export type AddCollectionSongsControllerState = {
  isAddingSelection: boolean;
  mutationError: string | null;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
};

export const initialAddCollectionSongsControllerState: AddCollectionSongsControllerState =
  {
    isAddingSelection: false,
    mutationError: null,
    savingSongId: null,
    selectedSongIds: new Set(),
  };

export const addCollectionSongsControllerReducer = (
  state: AddCollectionSongsControllerState,
  action: AddCollectionSongsControllerAction,
): AddCollectionSongsControllerState => {
  switch (action.type) {
    case "toggle-selection":
      return {
        ...state,
        mutationError: null,
        selectedSongIds: toggleSongIdSelection({
          selectedSongIds: state.selectedSongIds,
          songId: action.songId,
        }),
      };
    case "remove-selection":
      return {
        ...state,
        selectedSongIds: removeSongIdSelection({
          selectedSongIds: state.selectedSongIds,
          songId: action.songId,
        }),
      };
    case "clear-selection":
      return {
        ...state,
        selectedSongIds: new Set(),
      };
    case "begin-add-selection":
      return {
        ...state,
        isAddingSelection: true,
        mutationError: null,
      };
    case "begin-add-song":
      return {
        ...state,
        mutationError: null,
        savingSongId: action.songId,
      };
    case "finish-add-selection":
      return {
        ...state,
        isAddingSelection: false,
      };
    case "finish-add-song":
      return {
        ...state,
        savingSongId: null,
      };
    case "fail":
      return {
        ...state,
        mutationError: action.error,
      };
  }
};

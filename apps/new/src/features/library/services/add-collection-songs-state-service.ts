import {
  removeSongIdSelection,
  toggleSongIdSelection,
} from "./add-collection-songs-selection-service";

export type AddCollectionSongsMutationKind = "add-selection" | "add-song";

export type AddCollectionSongsControllerState = {
  isAddingSelection: boolean;
  mutationError: string | null;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
};

export type AddCollectionSongsControllerAction =
  | {
      songId: number;
      type: "toggle-selection";
    }
  | {
      songId: number;
      type: "remove-selection";
    }
  | {
      type: "clear-selection";
    }
  | {
      type: "begin-add-selection";
    }
  | {
      songId: number;
      type: "begin-add-song";
    }
  | {
      type: "finish-add-selection";
    }
  | {
      type: "finish-add-song";
    }
  | {
      error: string;
      type: "fail";
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

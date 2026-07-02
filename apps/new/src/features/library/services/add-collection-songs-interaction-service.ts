import type { AddableCollectionSong } from "./addable-collection-songs-service";

export const getSelectedAddableSongIds = ({
  selectedSongIds,
  songs,
}: {
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) =>
  Array.from(selectedSongIds).filter((songId) =>
    songs.some((song) => song.id === songId && !song.isLinked),
  );

export const getAddableSongSelectionState = ({
  isAddingSelection,
  savingSongId,
  selectedSongIds,
  songs,
}: {
  isAddingSelection: boolean;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  songs: AddableCollectionSong[];
}) => {
  const selectedAddableSongIds = getSelectedAddableSongIds({
    selectedSongIds,
    songs,
  });
  const selectedCount = selectedAddableSongIds.length;
  const isMutating = isAddingSelection || savingSongId !== null;

  return {
    bulkAddLabel: isAddingSelection ? "Adding" : "Add selected",
    canBulkAdd: selectedCount > 0 && !isMutating,
    isMutating,
    selectedAddableSongIds,
    selectedCount,
    selectionLabel:
      selectedCount === 0
        ? "Select songs to add several at once."
        : `${selectedCount} selected`,
  };
};

export type AddableSongSelectionState = ReturnType<
  typeof getAddableSongSelectionState
>;

export type AddCollectionSongsMutationKind = "add-selection" | "add-song";

export type AddCollectionSongsControllerState = {
  isAddingSelection: boolean;
  mutationError: string | null;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
};

export type AddCollectionSongsSearchState = {
  query: string;
};

export type AddCollectionSongsSearchAction = {
  query: string;
  type: "set-query";
};

export const initialAddCollectionSongsSearchState: AddCollectionSongsSearchState =
  {
    query: "",
  };

export const addCollectionSongsSearchReducer = (
  state: AddCollectionSongsSearchState,
  action: AddCollectionSongsSearchAction,
): AddCollectionSongsSearchState => {
  switch (action.type) {
    case "set-query":
      return {
        ...state,
        query: action.query,
      };
  }
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

export const getAddCollectionSongsMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: AddCollectionSongsMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "add-selection":
      return "Selected songs could not be added.";
    case "add-song":
      return "Song could not be added.";
  }
};

export const toggleSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);

  if (nextSelection.has(songId)) {
    nextSelection.delete(songId);
  } else {
    nextSelection.add(songId);
  }

  return nextSelection;
};

export const removeSongIdSelection = ({
  selectedSongIds,
  songId,
}: {
  selectedSongIds: Set<number>;
  songId: number;
}) => {
  const nextSelection = new Set(selectedSongIds);
  nextSelection.delete(songId);

  return nextSelection;
};

export const getAddableSongRowState = ({
  savingSongId,
  selectedSongIds,
  song,
}: {
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  song: AddableCollectionSong;
}) => {
  const isSaving = savingSongId === song.id;
  const isDisabled = song.isLinked || isSaving;
  const isSelected = selectedSongIds.has(song.id) && !song.isLinked;

  return {
    addLabel: song.isLinked ? "Added" : isSaving ? "Adding" : "Add",
    isDisabled,
    isSaving,
    isSelected,
  };
};

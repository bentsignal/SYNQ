import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
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

type AddCollectionSongsHapticCommand = {
  haptic: HapticFeedbackType;
};

type AddCollectionSongsActionCommand = AddCollectionSongsHapticCommand & {
  action: AddCollectionSongsControllerAction;
};

export const getAddCollectionSongsBlockedCommand =
  (): AddCollectionSongsHapticCommand => ({
    haptic: "error",
  });

export const getAddCollectionSongsSelectionStartCommand =
  (): AddCollectionSongsActionCommand => ({
    action: {
      type: "begin-add-selection",
    },
    haptic: "medium",
  });

export const getAddCollectionSongsSelectionSuccessCommand =
  (): AddCollectionSongsActionCommand => ({
    action: {
      type: "clear-selection",
    },
    haptic: "success",
  });

export const getAddCollectionSongsSongStartCommand = (
  songId: number,
): AddCollectionSongsActionCommand => ({
  action: {
    songId,
    type: "begin-add-song",
  },
  haptic: "light",
});

export const getAddCollectionSongsSongSuccessCommand = (
  songId: number,
): AddCollectionSongsActionCommand => ({
  action: {
    songId,
    type: "remove-selection",
  },
  haptic: "success",
});

export const getAddCollectionSongsFailureCommand = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: AddCollectionSongsMutationKind;
}): AddCollectionSongsActionCommand => ({
  action: {
    error: getAddCollectionSongsMutationErrorMessage({
      caughtError,
      mutation,
    }),
    type: "fail",
  },
  haptic: "error",
});

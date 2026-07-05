export type AddCollectionSongsMutationKind = "add-selection" | "add-song";

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

export const getAddCollectionSongsFinishSelectionAction =
  (): AddCollectionSongsControllerAction => ({
    type: "finish-add-selection",
  });

export const getAddCollectionSongsFinishSongAction =
  (): AddCollectionSongsControllerAction => ({
    type: "finish-add-song",
  });

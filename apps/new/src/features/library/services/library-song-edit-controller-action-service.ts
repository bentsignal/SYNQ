import type { LibrarySongDetail } from "./library-song-detail-types-service";

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

import type { ImportSongDraft } from "../types/import-session";

export const getImportSongEditInitialState = (song: ImportSongDraft) => ({
  album: song.album,
  artist: song.artist,
  error: null as string | null,
  title: song.title,
  track: song.track === null ? "" : String(song.track),
});

export type ImportSongEditFormState = ReturnType<
  typeof getImportSongEditInitialState
>;

export type ImportSongEditFormAction =
  | {
      field: "album" | "artist" | "title" | "track";
      type: "change-field";
      value: string;
    }
  | {
      error: string;
      type: "fail";
    }
  | {
      type: "clear-error";
    };

export type ImportSongEditFormField =
  Extract<ImportSongEditFormAction, { type: "change-field" }>["field"];

export const getImportSongEditChangeFieldAction = ({
  field,
  value,
}: {
  field: ImportSongEditFormField;
  value: string;
}): ImportSongEditFormAction => ({
  field,
  type: "change-field",
  value,
});

export const importSongEditFormReducer = (
  state: ImportSongEditFormState,
  action: ImportSongEditFormAction,
): ImportSongEditFormState => {
  switch (action.type) {
    case "change-field":
      return {
        ...state,
        [action.field]: action.value,
        error: null,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
      };
    case "clear-error":
      return {
        ...state,
        error: null,
      };
  }
};

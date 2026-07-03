import type { ImportSongDraft } from "../types/import-session";

export {
  buildEditedImportSongDraft,
  parseImportTrackInput,
} from "./import-song-edit-draft-service";

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

export const getImportSongEditFieldState = () =>
  ({
    album: {
      label: "Album",
      placeholder: "Album",
      returnKeyType: "next",
    },
    artist: {
      label: "Artist",
      placeholder: "Artist",
      returnKeyType: "next",
    },
    title: {
      label: "Title",
      placeholder: "Song title",
      returnKeyType: "next",
    },
    track: {
      label: "Track",
      placeholder: "Track number",
      returnKeyType: "done",
    },
  }) as const;

export const getImportSongEditActionState = ({ title }: { title: string }) => ({
  canSave: title.trim().length > 0,
});

export type ImportSongEditActionState = ReturnType<
  typeof getImportSongEditActionState
>;

export const getImportSongEditControllerResultState = ({
  formState,
}: {
  formState: ImportSongEditFormState;
}) => ({
  actionState: getImportSongEditActionState({
    title: formState.title,
  }),
  album: formState.album,
  artist: formState.artist,
  error: formState.error,
  title: formState.title,
  track: formState.track,
});

export type ImportSongEditControllerResultState = ReturnType<
  typeof getImportSongEditControllerResultState
>;

export const getImportSongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be updated.";

export const getImportSongEditRequiredTitleMessage = () => "Title is required.";

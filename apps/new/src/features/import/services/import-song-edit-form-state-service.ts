import type { ImportSongDraft } from "../types/import-session";

export const parseImportTrackInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const track = Number(trimmed);

  if (!Number.isInteger(track) || track < 1) {
    throw new Error("Track must be a positive whole number.");
  }

  return track;
};

export const buildEditedImportSongDraft = ({
  album,
  artist,
  song,
  title,
  track,
}: {
  album: string;
  artist: string;
  song: ImportSongDraft;
  title: string;
  track: string;
}) => ({
  ...song,
  album: album.trim() || "Unknown",
  artist: artist.trim() || "Unknown",
  title: title.trim(),
  track: parseImportTrackInput(track),
});

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

export const getImportSongEditErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Song could not be updated.";

export const getImportSongEditRequiredTitleMessage = () => "Title is required.";

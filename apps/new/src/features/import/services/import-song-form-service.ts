import type { ImportSongDraft } from "../types/import-session";

export type ImportSongEditHref =
  | `/import/edit/${number}`
  | "/(tabs)/import/files"
  | "/(tabs)/import/save";

export type ImportSongEditInvalidReason = "invalid-id" | "not-staged";

export const getImportSongEditHref = ({
  songId,
}: {
  songId: number;
}): ImportSongEditHref => `/import/edit/${songId}`;

export const getImportSongEditSaveHref = (): ImportSongEditHref =>
  "/(tabs)/import/save";

export const getImportSongEditFilesHref = (): ImportSongEditHref =>
  "/(tabs)/import/files";

export const getImportSongEditBackLinks = () => [
  {
    href: getImportSongEditSaveHref(),
    label: "Back to save",
  },
  {
    href: getImportSongEditFilesHref(),
    label: "Back to files",
  },
] as const;

export const getImportSongDraftForEdit = ({
  songId,
  songs,
}: {
  songId: number;
  songs: ImportSongDraft[];
}) => songs.find((draft) => draft.id === songId) ?? null;

export const getImportSongEditInvalidState = (
  reason: ImportSongEditInvalidReason,
) => {
  switch (reason) {
    case "invalid-id":
      return {
        kicker: "Import edit",
        links: [
          {
            href: getImportSongEditSaveHref(),
            label: "Back to save",
          },
        ],
        subtitle: "This route needs a numeric id.",
        title: "Invalid song",
      };
    case "not-staged":
      return {
        kicker: "Import edit",
        links: [
          {
            href: getImportSongEditFilesHref(),
            label: "Back to files",
          },
          {
            href: getImportSongEditSaveHref(),
            label: "Back to save",
          },
        ],
        subtitle: "Choose songs again or return to the current review.",
        title: "Song not staged",
      };
  }
};

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
  title: song.title,
  track: song.track === null ? "" : String(song.track),
});

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

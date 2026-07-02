import type { ImportSongDraft } from "../types/import-session";

export type ImportSongEditHref =
  | `/import/edit/${number}`
  | "/(tabs)/import/files"
  | "/(tabs)/import/save";

export const getImportSongEditHref = ({
  songId,
}: {
  songId: number;
}): ImportSongEditHref => `/import/edit/${songId}`;

export const getImportSongEditSaveHref = (): ImportSongEditHref =>
  "/(tabs)/import/save";

export const getImportSongEditFilesHref = (): ImportSongEditHref =>
  "/(tabs)/import/files";

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

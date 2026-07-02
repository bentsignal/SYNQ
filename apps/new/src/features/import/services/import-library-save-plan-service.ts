import type { ImportSongDraft } from "../types/import-session";

const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);

export type ImportLibrarySongSavePlan = {
  albumName: string | null;
  artistNames: string[];
};

export const normalizeImportLibraryName = (name: string) => name.trim();

export const hasMeaningfulImportLibraryName = (name: string) =>
  !unknownLabels.has(normalizeImportLibraryName(name).toLowerCase());

export const splitImportLibraryNames = (value: string) =>
  value
    .split(",")
    .map(normalizeImportLibraryName)
    .filter(hasMeaningfulImportLibraryName);

export const buildImportLibrarySongSavePlan = (
  song: ImportSongDraft,
): ImportLibrarySongSavePlan => ({
  albumName: hasMeaningfulImportLibraryName(song.album)
    ? normalizeImportLibraryName(song.album)
    : null,
  artistNames: splitImportLibraryNames(song.artist),
});

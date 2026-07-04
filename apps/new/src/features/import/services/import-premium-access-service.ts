import type { ImportSongDraft } from "../types/import-session";

export const getPremiumScopedImportSongs = ({
  premiumActive,
  songs,
}: {
  premiumActive: boolean;
  songs: ImportSongDraft[];
}) => (premiumActive ? songs : songs.slice(0, 1));

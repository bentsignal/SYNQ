import type { ImportSongDraft } from "../types/import-session";

export const getImportSongDraftForEdit = ({
  songId,
  songs,
}: {
  songId: number;
  songs: ImportSongDraft[];
}) => songs.find((draft) => draft.id === songId) ?? null;

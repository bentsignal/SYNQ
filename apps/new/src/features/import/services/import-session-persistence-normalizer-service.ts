import type { ImportSessionState, ImportSongDraft } from "../types/import-session";

export type PersistedImportSession = {
  selectedSongId: number | null;
  shouldSaveToLibrary: boolean;
  songs: ImportSongDraft[];
  source: ImportSessionState["source"];
};

const isImportSongDraft = (value: unknown): value is ImportSongDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<ImportSongDraft>;

  return (
    typeof draft.album === "string" &&
    typeof draft.artist === "string" &&
    typeof draft.cacheUri === "string" &&
    typeof draft.fileName === "string" &&
    typeof draft.fileType === "string" &&
    typeof draft.id === "number" &&
    typeof draft.title === "string"
  );
};

export const normalizePersistedImportSession = (
  value: unknown,
): PersistedImportSession | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<PersistedImportSession>;
  const songs = Array.isArray(session.songs)
    ? session.songs.filter(isImportSongDraft)
    : [];

  if (songs.length === 0) {
    return null;
  }

  return {
    selectedSongId:
      typeof session.selectedSongId === "number"
        ? session.selectedSongId
        : songs[0]?.id ?? null,
    shouldSaveToLibrary:
      typeof session.shouldSaveToLibrary === "boolean"
        ? session.shouldSaveToLibrary
        : true,
    songs,
    source: session.source === "wifi" ? "wifi" : "files",
  };
};

export const toPersistedImportSession = (
  state: ImportSessionState,
): PersistedImportSession => ({
  selectedSongId: state.selectedSongId,
  shouldSaveToLibrary: state.shouldSaveToLibrary,
  songs: state.songs,
  source: state.source,
});

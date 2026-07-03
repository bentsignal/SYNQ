import type { ImportSessionState, ImportSongDraft } from "../types/import-session";

const importSessionDirectoryName = "import";
const importSessionFileName = "session.json";

export type ImportSessionPersistencePathDependencies = {
  documentDirectory: string | null;
};

export type PersistedImportSessionSnapshot = {
  selectedSongId: number | null;
  shouldSaveToLibrary: boolean;
  songs: ImportSongDraft[];
  source: ImportSessionState["source"];
};

export const getImportSessionDirectory = ({
  documentDirectory,
}: ImportSessionPersistencePathDependencies) => {
  if (!documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${documentDirectory}${importSessionDirectoryName}`;
};

export const getImportSessionFile = (
  dependencies: ImportSessionPersistencePathDependencies,
) => `${getImportSessionDirectory(dependencies)}/${importSessionFileName}`;

export const getRestoredImportSessionState = ({
  persistedSession,
  songs,
}: {
  persistedSession: PersistedImportSessionSnapshot;
  songs: ImportSongDraft[];
}): ImportSessionState | null => {
  if (songs.length === 0) {
    return null;
  }

  return {
    error: null,
    phase: "reviewing",
    progress: {
      current: songs.length,
      total: songs.length,
    },
    saveSummary: null,
    selectedSongId: songs.some(
      (song) => song.id === persistedSession.selectedSongId,
    )
      ? persistedSession.selectedSongId
      : songs[0]?.id ?? null,
    shouldSaveToLibrary: persistedSession.shouldSaveToLibrary,
    songs,
    source: persistedSession.source,
  };
};

import type { ImportSessionState, ImportSongDraft } from "../types/import-session";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
} from "./import-session-persistence-normalizer-service";

export type ImportSessionPersistenceDependencies = {
  deletePath: (
    path: string,
    options: { idempotent: true },
  ) => Promise<void>;
  documentDirectory: string | null;
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  makeDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  readAsString: (path: string) => Promise<string>;
  writeAsString: (path: string, contents: string) => Promise<void>;
};

const importSessionDirectoryName = "import";
const importSessionFileName = "session.json";

export const getImportSessionDirectoryWithDependencies = ({
  documentDirectory,
}: Pick<ImportSessionPersistenceDependencies, "documentDirectory">) => {
  if (!documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  return `${documentDirectory}${importSessionDirectoryName}`;
};

export const getImportSessionFileWithDependencies = (
  dependencies: Pick<ImportSessionPersistenceDependencies, "documentDirectory">,
) =>
  `${getImportSessionDirectoryWithDependencies(
    dependencies,
  )}/${importSessionFileName}`;

const filterExistingDraftsWithDependencies = async ({
  dependencies,
  songs,
}: {
  dependencies: ImportSessionPersistenceDependencies;
  songs: ImportSongDraft[];
}) => {
  const existingSongs: ImportSongDraft[] = [];

  for (const song of songs) {
    const fileInfo = await dependencies.getInfo(song.cacheUri);
    if (fileInfo.exists) {
      existingSongs.push(song);
    }
  }

  return existingSongs;
};

export async function clearPersistedImportSessionStateWithDependencies(
  dependencies: ImportSessionPersistenceDependencies,
) {
  try {
    await dependencies.deletePath(
      getImportSessionFileWithDependencies(dependencies),
      { idempotent: true },
    );
  } catch {
    // Cleanup should be best-effort when the document directory is unavailable.
  }
}

export async function loadPersistedImportSessionStateWithDependencies(
  dependencies: ImportSessionPersistenceDependencies,
): Promise<ImportSessionState | null> {
  try {
    const importSessionFile =
      getImportSessionFileWithDependencies(dependencies);
    const fileInfo = await dependencies.getInfo(importSessionFile);
    if (!fileInfo.exists) {
      return null;
    }

    const contents = await dependencies.readAsString(importSessionFile);
    const persistedSession = normalizePersistedImportSession(
      JSON.parse(contents),
    );

    if (!persistedSession) {
      await clearPersistedImportSessionStateWithDependencies(dependencies);
      return null;
    }

    const songs = await filterExistingDraftsWithDependencies({
      dependencies,
      songs: persistedSession.songs,
    });
    if (songs.length === 0) {
      await clearPersistedImportSessionStateWithDependencies(dependencies);
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
      selectedSongId:
        songs.some((song) => song.id === persistedSession.selectedSongId)
          ? persistedSession.selectedSongId
          : songs[0]?.id ?? null,
      shouldSaveToLibrary: persistedSession.shouldSaveToLibrary,
      songs,
      source: persistedSession.source,
    };
  } catch {
    return null;
  }
}

export async function savePersistedImportSessionStateWithDependencies({
  dependencies,
  state,
}: {
  dependencies: ImportSessionPersistenceDependencies;
  state: ImportSessionState;
}) {
  if (state.songs.length === 0) {
    await clearPersistedImportSessionStateWithDependencies(dependencies);
    return;
  }

  const importSessionDirectory =
    getImportSessionDirectoryWithDependencies(dependencies);
  await dependencies.makeDirectory(importSessionDirectory, {
    intermediates: true,
  });
  await dependencies.writeAsString(
    `${importSessionDirectory}/${importSessionFileName}`,
    JSON.stringify(toPersistedImportSession(state), null, 2),
  );
}

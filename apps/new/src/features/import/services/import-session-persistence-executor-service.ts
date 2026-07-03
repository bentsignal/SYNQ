import type { ImportSessionState, ImportSongDraft } from "../types/import-session";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
} from "./import-session-persistence-normalizer-service";
import {
  getImportSessionDirectory,
  getImportSessionFile,
  getRestoredImportSessionState,
} from "./import-session-persistence-step-service";

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

const importSessionFileName = "session.json";

export const getImportSessionDirectoryWithDependencies = ({
  documentDirectory,
}: Pick<ImportSessionPersistenceDependencies, "documentDirectory">) => {
  return getImportSessionDirectory({ documentDirectory });
};

export const getImportSessionFileWithDependencies = (
  dependencies: Pick<ImportSessionPersistenceDependencies, "documentDirectory">,
) => getImportSessionFile(dependencies);

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

    return getRestoredImportSessionState({ persistedSession, songs });
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

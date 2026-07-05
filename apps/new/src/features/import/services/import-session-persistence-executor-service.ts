import type { ImportSessionState } from "../types/import-session";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import { filterExistingImportDraftsWithDependencies } from "./import-session-persistence-filter-service";
import {
  normalizePersistedImportSession,
  toPersistedImportSession,
} from "./import-session-persistence-normalizer-service";
import {
  getImportSessionDirectory,
  getImportSessionFile,
  getRestoredImportSessionState,
} from "./import-session-persistence-step-service";

export type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";

const importSessionFileName = "session.json";

export const getImportSessionDirectoryWithDependencies = ({
  documentDirectory,
}: Pick<ImportSessionPersistenceDependencies, "documentDirectory">) => {
  return getImportSessionDirectory({ documentDirectory });
};

export const getImportSessionFileWithDependencies = (
  dependencies: Pick<ImportSessionPersistenceDependencies, "documentDirectory">,
) => getImportSessionFile(dependencies);

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

    const songs = await filterExistingImportDraftsWithDependencies({
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

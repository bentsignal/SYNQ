import type { ImportSessionState } from "../types/import-session";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import { loadPersistedImportSessionStateFromFile } from "./import-session-persistence-loader-service";
import { writePersistedImportSessionState } from "./import-session-persistence-writer-service";
import {
  getImportSessionDirectory,
  getImportSessionFile,
} from "./import-session-persistence-step-service";

export type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";

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
    return await loadPersistedImportSessionStateFromFile({
      clearPersistedState: () =>
        clearPersistedImportSessionStateWithDependencies(dependencies),
      contents,
      dependencies,
    });
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
  await writePersistedImportSessionState({
    dependencies,
    importSessionDirectory,
    state,
  });
}

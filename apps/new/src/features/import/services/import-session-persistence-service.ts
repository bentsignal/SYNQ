import * as FileSystem from "expo-file-system";
import {
  clearPersistedImportSessionStateWithDependencies,
  loadPersistedImportSessionStateWithDependencies,
  savePersistedImportSessionStateWithDependencies,
} from "./import-session-persistence-executor-service";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import type { ImportSessionState } from "../types/import-session";

const importSessionPersistenceDependencies: ImportSessionPersistenceDependencies =
  {
    deletePath: FileSystem.deleteAsync,
    documentDirectory: FileSystem.documentDirectory,
    getInfo: FileSystem.getInfoAsync,
    makeDirectory: FileSystem.makeDirectoryAsync,
    readAsString: FileSystem.readAsStringAsync,
    writeAsString: FileSystem.writeAsStringAsync,
  };

export async function loadPersistedImportSessionState(): Promise<ImportSessionState | null> {
  return loadPersistedImportSessionStateWithDependencies(
    importSessionPersistenceDependencies,
  );
}

export async function savePersistedImportSessionState(
  state: ImportSessionState,
) {
  await savePersistedImportSessionStateWithDependencies({
    dependencies: importSessionPersistenceDependencies,
    state,
  });
}

export async function clearPersistedImportSessionState() {
  await clearPersistedImportSessionStateWithDependencies(
    importSessionPersistenceDependencies,
  );
}

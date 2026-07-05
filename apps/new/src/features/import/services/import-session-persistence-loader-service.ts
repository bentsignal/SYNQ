import type { ImportSessionState } from "../types/import-session";
import type {
  ImportSessionPersistenceDependencies,
} from "./import-session-persistence-dependencies-service";
import { filterExistingImportDraftsWithDependencies } from "./import-session-persistence-filter-service";
import {
  parsePersistedImportSession,
} from "./import-session-persistence-codec-service";
import {
  getRestoredImportSessionState,
} from "./import-session-persistence-step-service";

export const loadPersistedImportSessionStateFromFile = async ({
  clearPersistedState,
  contents,
  dependencies,
}: {
  clearPersistedState: () => Promise<void>;
  contents: string;
  dependencies: ImportSessionPersistenceDependencies;
}): Promise<ImportSessionState | null> => {
  const persistedSession = parsePersistedImportSession(contents);

  if (!persistedSession) {
    await clearPersistedState();
    return null;
  }

  const songs = await filterExistingImportDraftsWithDependencies({
    dependencies,
    songs: persistedSession.songs,
  });
  if (songs.length === 0) {
    await clearPersistedState();
    return null;
  }

  return getRestoredImportSessionState({ persistedSession, songs });
};

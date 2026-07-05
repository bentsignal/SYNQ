import { clearImportCache } from "./import-file-cache-service";
import {
  discardImportSession,
  saveImportSessionToLibrary,
} from "./import-library-save-service";
import type { ImportSessionLifecycleDependencies } from "./import-session-lifecycle-service";
import { clearPersistedImportSessionState } from "./import-session-persistence-service";

export const importSessionLifecycleDependencies: ImportSessionLifecycleDependencies =
  {
    clearImportCache,
    clearPersistedImportSessionState,
    discardImportSession,
    saveImportSessionToLibrary,
  };

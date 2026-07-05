import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";
import { getFinishImportSessionAction } from "./import-session-lifecycle-result-service";

export type ImportSessionLifecycleDependencies = {
  clearImportCache: () => Promise<void>;
  clearPersistedImportSessionState: () => Promise<void>;
  discardImportSession: (
    songs: ImportSessionState["songs"],
  ) => Promise<ImportSaveSummary>;
  saveImportSessionToLibrary: (
    songs: ImportSessionState["songs"],
  ) => Promise<ImportSaveSummary>;
};

export { getFinishImportSessionAction };
export { discardImportSessionLifecycle } from "./import-session-discard-lifecycle-service";
export { resetImportSessionLifecycle } from "./import-session-reset-lifecycle-service";
export { saveImportSessionLifecycle } from "./import-session-save-lifecycle-service";

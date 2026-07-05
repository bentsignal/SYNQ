import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";
import {
  runDiscardImportSessionCommand,
  runFinishImportSessionCommand,
  runResetImportSessionCommand,
  runSaveImportSessionCommand,
} from "./import-session-lifecycle-command-flow-service";
import type { ImportSessionLifecycleDependencies } from "./import-session-lifecycle-service";
import type { ImportSessionAction } from "./import-session-action-service";

type CreateImportSessionLifecycleCommandsParams = {
  dependencies: ImportSessionLifecycleDependencies;
  dispatch: (action: ImportSessionAction) => void;
  premiumActive: boolean;
  shouldSaveToLibrary: boolean;
  songs: ImportSessionState["songs"];
};

export type ImportSessionLifecycleCommands = {
  discardSession: () => Promise<boolean>;
  finishSession: (summary: ImportSaveSummary) => void;
  resetSession: () => void;
  saveImportSession: () => Promise<boolean>;
};

export const createImportSessionLifecycleCommands = ({
  dependencies,
  dispatch,
  premiumActive,
  shouldSaveToLibrary,
  songs,
}: CreateImportSessionLifecycleCommandsParams): ImportSessionLifecycleCommands => ({
  discardSession: () =>
    runDiscardImportSessionCommand({
      dependencies,
      dispatch,
    }),
  finishSession: (summary) => {
    runFinishImportSessionCommand({
      dispatch,
      summary,
    });
  },
  resetSession: () => {
    runResetImportSessionCommand({
      dependencies,
      dispatch,
    });
  },
  saveImportSession: () =>
    runSaveImportSessionCommand({
      dependencies,
      dispatch,
      premiumActive,
      shouldSaveToLibrary,
      songs,
    }),
});

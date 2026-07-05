import type { ImportSessionAction } from "./import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

export type ImportFileCommandDispatch = (action: ImportSessionAction) => void;

export type ImportFileCommandFlowDependencies = {
  deleteImportDraftCacheFiles: (songs: ImportSongDraft[]) => Promise<void>;
  selectImportFiles: () => Promise<{
    drafts: ImportSongDraft[];
    skipped: number;
  }>;
};

export { runImportFileRemovalCommand } from "./import-file-removal-command-flow-service";
export { runImportFileSelectionCommand } from "./import-file-selection-command-flow-service";

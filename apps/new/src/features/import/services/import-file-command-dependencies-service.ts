import { deleteImportDraftCacheFiles } from "./import-file-cache-service";
import type { ImportFileCommandFlowDependencies } from "./import-file-command-flow-service";
import { selectImportFiles } from "./import-file-service";

export const importFileCommandDependencies: ImportFileCommandFlowDependencies =
  {
    deleteImportDraftCacheFiles,
    selectImportFiles,
  };

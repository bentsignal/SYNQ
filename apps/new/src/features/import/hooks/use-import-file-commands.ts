import { useMemo } from "react";
import { deleteImportDraftCacheFiles } from "../services/import-file-cache-service";
import {
  createImportFileCommands,
} from "../services/import-file-command-controller-service";
import type { ImportFileCommandFlowDependencies } from "../services/import-file-command-flow-service";
import { selectImportFiles } from "../services/import-file-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

export function useImportFileCommands({
  dispatch,
  songs,
}: {
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
}) {
  const dependencies = useMemo<ImportFileCommandFlowDependencies>(
    () => ({
      deleteImportDraftCacheFiles,
      selectImportFiles,
    }),
    [],
  );

  return useMemo(
    () =>
      createImportFileCommands({
        dependencies,
        dispatch,
        songs,
      }),
    [dependencies, dispatch, songs],
  );
}

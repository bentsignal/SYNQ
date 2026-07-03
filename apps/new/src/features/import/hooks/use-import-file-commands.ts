import { useCallback, useMemo } from "react";
import { deleteImportDraftCacheFiles } from "../services/import-file-cache-service";
import { selectImportFiles } from "../services/import-file-service";
import {
  runImportFileRemovalCommand,
  runImportFileSelectionCommand,
  type ImportFileCommandFlowDependencies,
} from "../services/import-file-command-flow-service";
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

  const startFileImport = useCallback(async () => {
    return runImportFileSelectionCommand({
      dependencies,
      dispatch,
    });
  }, [dependencies, dispatch]);

  const removeImportSongs = useCallback(
    async (songIds: number[]) => {
      return runImportFileRemovalCommand({
        dependencies,
        dispatch,
        songIds,
        songs,
      });
    },
    [dependencies, dispatch, songs],
  );

  return {
    removeImportSongs,
    startFileImport,
  };
}

import { useMemo } from "react";
import {
  createImportFileCommands,
} from "../services/import-file-command-controller-service";
import { importFileCommandDependencies } from "../services/import-file-command-dependencies-service";
import type { ImportSessionAction } from "../services/import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

export function useImportFileCommands({
  dispatch,
  songs,
}: {
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
}) {
  return useMemo(
    () =>
      createImportFileCommands({
        dependencies: importFileCommandDependencies,
        dispatch,
        songs,
      }),
    [dispatch, songs],
  );
}

import { useMemo } from "react";
import { createImportCacheDirectory } from "../services/import-file-cache-service";
import {
  createImportSessionWifiCommands,
} from "../services/import-session-wifi-command-service";
import type { ImportSessionAction } from "../services/import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

type UseImportSessionWifiCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  songs: ImportSongDraft[];
};

export function useImportSessionWifiCommands({
  dispatch,
  songs,
}: UseImportSessionWifiCommandsParams) {
  return useMemo(
    () =>
      createImportSessionWifiCommands({
        dispatch,
        prepareWifiImportCache: createImportCacheDirectory,
        songs,
      }),
    [dispatch, songs],
  );
}

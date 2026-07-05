import { useMemo } from "react";
import {
  createImportSessionCommands,
  type ImportSessionCommands,
} from "../services/import-session-command-composer-service";
import type { ImportSessionAction } from "../services/import-session-state-service";
import type { ImportSessionState } from "../types/import-session";
import { useImportFileCommands } from "./use-import-file-commands";
import { useImportSessionBasicCommands } from "./use-import-session-basic-commands";
import { useImportSessionLifecycleCommands } from "./use-import-session-lifecycle-commands";
import { useImportSessionWifiCommands } from "./use-import-session-wifi-commands";

type UseImportSessionCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
  premiumActive: boolean;
  state: ImportSessionState;
};

export function useImportSessionCommands({
  dispatch,
  premiumActive,
  state,
}: UseImportSessionCommandsParams) {
  const fileCommands = useImportFileCommands({
    dispatch,
    songs: state.songs,
  });
  const basicCommands = useImportSessionBasicCommands({ dispatch });
  const wifiCommands = useImportSessionWifiCommands({
    dispatch,
    songs: state.songs,
  });

  const lifecycleCommands = useImportSessionLifecycleCommands({
    dispatch,
    premiumActive,
    shouldSaveToLibrary: state.shouldSaveToLibrary,
    songs: state.songs,
  });

  return useMemo<ImportSessionCommands>(
    () =>
      createImportSessionCommands({
        basicCommands,
        fileCommands,
        lifecycleCommands,
        wifiCommands,
      }),
    [basicCommands, fileCommands, lifecycleCommands, wifiCommands],
  );
}

export type { ImportSessionCommands };

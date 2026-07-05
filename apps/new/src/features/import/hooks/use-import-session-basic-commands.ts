import { useMemo } from "react";
import {
  createImportSessionBasicCommands,
} from "../services/import-session-basic-command-service";
import type { ImportSessionAction } from "../services/import-session-state-service";

type UseImportSessionBasicCommandsParams = {
  dispatch: (action: ImportSessionAction) => void;
};

export function useImportSessionBasicCommands({
  dispatch,
}: UseImportSessionBasicCommandsParams) {
  return useMemo(
    () => createImportSessionBasicCommands({ dispatch }),
    [dispatch],
  );
}

import type { ImportSaveSessionResultCommand } from "./import-save-session-command-service";
import { getImportFinishResultHref } from "./import-navigation-service";

export const getImportFinishResultCommand = (
  succeeded: boolean,
): ImportSaveSessionResultCommand => ({
  haptic: succeeded ? "success" : "error",
  href: getImportFinishResultHref(succeeded),
});

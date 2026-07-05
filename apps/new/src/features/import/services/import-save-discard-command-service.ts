import type { ImportSaveSessionResultCommand } from "./import-save-session-command-service";
import { getImportDiscardResultHref } from "./import-navigation-service";

export const getImportDiscardResultCommand = (
  discarded: boolean,
): ImportSaveSessionResultCommand => ({
  haptic: discarded ? "success" : "error",
  href: getImportDiscardResultHref(discarded),
});

import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportNavigationHref } from "./import-navigation-service";

export type ImportSaveSessionResultCommand = {
  href: ImportNavigationHref;
  haptic: HapticFeedbackType;
};

export const getImportSaveSessionStartHaptic = (): HapticFeedbackType =>
  "medium";

export { getImportDiscardResultCommand } from "./import-save-discard-command-service";
export { getImportFinishResultCommand } from "./import-save-finish-command-service";
export { getImportSaveToggleCommand } from "./import-save-toggle-command-service";
export type { ImportSaveToggleCommand } from "./import-save-toggle-command-service";

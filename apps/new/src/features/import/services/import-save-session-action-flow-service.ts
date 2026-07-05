import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportNavigationHref } from "./import-navigation-service";

export type ImportSaveSessionActionDependencies = {
  navigate: (href: ImportNavigationHref) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export { runImportDiscardAction } from "./import-save-discard-action-flow-service";
export { runImportFinishAction } from "./import-save-finish-action-flow-service";
export { runImportSaveToggleAction } from "./import-save-toggle-action-flow-service";

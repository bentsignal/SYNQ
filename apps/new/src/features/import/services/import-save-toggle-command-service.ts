import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSessionState } from "../types/import-session";

export type ImportSaveToggleCommand = {
  haptic: HapticFeedbackType;
  shouldSaveToLibrary: boolean;
};

export const getImportSaveToggleCommand = (
  state: Pick<ImportSessionState, "shouldSaveToLibrary">,
): ImportSaveToggleCommand => ({
  haptic: "light",
  shouldSaveToLibrary: !state.shouldSaveToLibrary,
});

import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportDiscardResultHref,
  getImportFinishResultHref,
  type ImportNavigationHref,
} from "./import-navigation-service";
import type { ImportSessionState } from "../types/import-session";

type ImportSaveToggleCommand = {
  haptic: HapticFeedbackType;
  shouldSaveToLibrary: boolean;
};

type ImportSaveSessionResultCommand = {
  href: ImportNavigationHref;
  haptic: HapticFeedbackType;
};

export const getImportSaveToggleCommand = (
  state: Pick<ImportSessionState, "shouldSaveToLibrary">,
): ImportSaveToggleCommand => ({
  haptic: "light",
  shouldSaveToLibrary: !state.shouldSaveToLibrary,
});

export const getImportSaveSessionStartHaptic = (): HapticFeedbackType =>
  "medium";

export const getImportFinishResultCommand = (
  succeeded: boolean,
): ImportSaveSessionResultCommand => ({
  haptic: succeeded ? "success" : "error",
  href: getImportFinishResultHref(succeeded),
});

export const getImportDiscardResultCommand = (
  discarded: boolean,
): ImportSaveSessionResultCommand => ({
  haptic: discarded ? "success" : "error",
  href: getImportDiscardResultHref(discarded),
});

import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import type { ImportSessionState } from "../types/import-session";
import {
  runImportDiscardAction,
  runImportFinishAction,
  runImportSaveToggleAction,
} from "./import-save-session-action-flow-service";
import type { ImportNavigationHref } from "./import-navigation-service";

type CreateImportSaveSessionActionsParams = {
  discardSession: () => Promise<boolean>;
  navigate: (href: ImportNavigationHref) => void;
  requestReviewIfEligible: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
  sendHaptic: (type: HapticFeedbackType) => void;
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: Pick<ImportSessionState, "shouldSaveToLibrary">;
};

export type ImportSaveSessionActions = {
  discardImport: () => Promise<void>;
  finishImport: () => Promise<void>;
  toggleShouldSaveToLibrary: () => void;
};

export const createImportSaveSessionActions = ({
  discardSession,
  navigate,
  requestReviewIfEligible,
  saveImportSession,
  sendHaptic,
  setShouldSaveToLibrary,
  state,
}: CreateImportSaveSessionActionsParams): ImportSaveSessionActions => ({
  discardImport: () =>
    runImportDiscardAction({
      discardSession,
      navigate,
      sendHaptic,
    }),
  finishImport: () =>
    runImportFinishAction({
      navigate,
      requestReviewIfEligible,
      saveImportSession,
      sendHaptic,
    }),
  toggleShouldSaveToLibrary: () => {
    runImportSaveToggleAction({
      sendHaptic,
      setShouldSaveToLibrary,
      state,
    });
  },
});

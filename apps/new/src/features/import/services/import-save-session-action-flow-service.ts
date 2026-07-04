import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportDiscardResultCommand,
  getImportFinishResultCommand,
  getImportSaveSessionStartHaptic,
  getImportSaveToggleCommand,
} from "./import-save-session-command-service";
import type { ImportNavigationHref } from "./import-navigation-service";
import type { ImportSessionState } from "../types/import-session";

type ImportSaveSessionActionDependencies = {
  navigate: (href: ImportNavigationHref) => void;
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const runImportSaveToggleAction = ({
  sendHaptic,
  setShouldSaveToLibrary,
  state,
}: Pick<ImportSaveSessionActionDependencies, "sendHaptic"> & {
  setShouldSaveToLibrary: (shouldSaveToLibrary: boolean) => void;
  state: Pick<ImportSessionState, "shouldSaveToLibrary">;
}) => {
  const command = getImportSaveToggleCommand(state);
  sendHaptic(command.haptic);
  setShouldSaveToLibrary(command.shouldSaveToLibrary);
};

export const runImportFinishAction = async ({
  navigate,
  requestReviewIfEligible,
  saveImportSession,
  sendHaptic,
}: ImportSaveSessionActionDependencies & {
  requestReviewIfEligible?: () => Promise<boolean>;
  saveImportSession: () => Promise<boolean>;
}) => {
  sendHaptic(getImportSaveSessionStartHaptic());
  const succeeded = await saveImportSession();
  if (succeeded) {
    void requestReviewIfEligible?.();
  }
  const command = getImportFinishResultCommand(succeeded);
  sendHaptic(command.haptic);
  navigate(command.href);
};

export const runImportDiscardAction = async ({
  discardSession,
  navigate,
  sendHaptic,
}: ImportSaveSessionActionDependencies & {
  discardSession: () => Promise<boolean>;
}) => {
  sendHaptic(getImportSaveSessionStartHaptic());
  const discarded = await discardSession();
  const command = getImportDiscardResultCommand(discarded);
  sendHaptic(command.haptic);
  navigate(command.href);
};

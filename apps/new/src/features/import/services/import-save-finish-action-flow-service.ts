import type { ImportSaveSessionActionDependencies } from "./import-save-session-action-flow-service";
import {
  getImportFinishResultCommand,
  getImportSaveSessionStartHaptic,
} from "./import-save-session-command-service";

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

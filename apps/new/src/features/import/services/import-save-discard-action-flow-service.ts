import type { ImportSaveSessionActionDependencies } from "./import-save-session-action-flow-service";
import {
  getImportDiscardResultCommand,
  getImportSaveSessionStartHaptic,
} from "./import-save-session-command-service";

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

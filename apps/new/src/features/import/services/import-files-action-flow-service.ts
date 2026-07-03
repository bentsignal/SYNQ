import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportFileRemovalResultCommand,
  getImportFileRemovalStartHaptic,
  getImportFileSelectionResultCommand,
  getImportFileSelectionStartHaptic,
} from "./import-file-command-service";
import type { ImportNavigationHref } from "./import-navigation-service";

type ImportFilesActionDependencies = {
  sendHaptic: (type: HapticFeedbackType) => void;
};

export const runImportFilesChooseAction = async ({
  navigate,
  sendHaptic,
  startFileImport,
}: ImportFilesActionDependencies & {
  navigate: (href: ImportNavigationHref) => void;
  startFileImport: () => Promise<boolean>;
}) => {
  sendHaptic(getImportFileSelectionStartHaptic());
  const staged = await startFileImport();
  const command = getImportFileSelectionResultCommand(staged);

  sendHaptic(command.haptic);
  navigate(command.href);
};

export const runImportFilesRemoveAction = async ({
  removeImportSongs,
  sendHaptic,
  songId,
}: ImportFilesActionDependencies & {
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  songId: number;
}) => {
  sendHaptic(getImportFileRemovalStartHaptic());
  const removed = await removeImportSongs([songId]);
  const command = getImportFileRemovalResultCommand(removed);

  sendHaptic(command.haptic);
};

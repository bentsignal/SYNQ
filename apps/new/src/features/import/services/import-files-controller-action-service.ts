import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  runImportFilesChooseAction,
  runImportFilesRemoveAction,
} from "./import-files-action-flow-service";
import type { ImportNavigationHref } from "./import-navigation-service";

type CreateImportFilesControllerActionsParams = {
  navigate: (href: ImportNavigationHref) => void;
  removeImportSongs: (songIds: number[]) => Promise<boolean>;
  sendHaptic: (type: HapticFeedbackType) => void;
  startFileImport: () => Promise<boolean>;
};

export type ImportFilesControllerActions = {
  chooseFiles: () => Promise<void>;
  removeSong: (songId: number) => Promise<void>;
};

export const createImportFilesControllerActions = ({
  navigate,
  removeImportSongs,
  sendHaptic,
  startFileImport,
}: CreateImportFilesControllerActionsParams): ImportFilesControllerActions => ({
  chooseFiles: () =>
    runImportFilesChooseAction({
      navigate,
      sendHaptic,
      startFileImport,
    }),
  removeSong: (songId) =>
    runImportFilesRemoveAction({
      removeImportSongs,
      sendHaptic,
      songId,
    }),
});

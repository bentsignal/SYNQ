import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportSongEditSaveHref,
  type ImportSongEditHref,
} from "./import-song-edit-navigation-service";
import {
  getImportSongEditErrorMessage,
  getImportSongEditRequiredTitleMessage,
} from "./import-song-edit-error-copy-service";
import type { ImportSongEditFormAction } from "./import-song-edit-form-reducer-service";

type ImportSongEditInvalidSaveCommand = {
  action: ImportSongEditFormAction;
  haptic: HapticFeedbackType;
};

type ImportSongEditSaveSuccessCommand = {
  haptic: HapticFeedbackType;
  href: ImportSongEditHref;
};

type ImportSongEditSaveFailureCommand = {
  action: ImportSongEditFormAction;
  haptic: HapticFeedbackType;
};

export const getImportSongEditInvalidSaveCommand =
  (): ImportSongEditInvalidSaveCommand => ({
    action: {
      error: getImportSongEditRequiredTitleMessage(),
      type: "fail",
    },
    haptic: "error",
  });

export const getImportSongEditSaveSuccessCommand =
  (): ImportSongEditSaveSuccessCommand => ({
    haptic: "success",
    href: getImportSongEditSaveHref(),
  });

export const getImportSongEditSaveFailureCommand = (
  caughtError: unknown,
): ImportSongEditSaveFailureCommand => ({
  action: {
    error: getImportSongEditErrorMessage(caughtError),
    type: "fail",
  },
  haptic: "error",
});

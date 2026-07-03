import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";
import {
  getImportFilesResultHref,
  type ImportNavigationHref,
} from "./import-navigation-service";

export type ImportFileCommandMutation = "remove-staged-songs" | "select-files";

export const getImportFileCommandErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: ImportFileCommandMutation;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "remove-staged-songs":
      return "Selected staged songs could not be removed.";
    case "select-files":
      return "Files could not be selected.";
  }
};

type ImportFileResultCommand = {
  haptic: HapticFeedbackType;
};

type ImportFileSelectionResultCommand = ImportFileResultCommand & {
  href: ImportNavigationHref;
};

export const getImportFileSelectionStartHaptic = (): HapticFeedbackType =>
  "light";

export const getImportFileSelectionResultCommand = (
  staged: boolean,
): ImportFileSelectionResultCommand => ({
  haptic: staged ? "success" : "error",
  href: getImportFilesResultHref(staged),
});

export const getImportFileRemovalStartHaptic = (): HapticFeedbackType =>
  "medium";

export const getImportFileRemovalResultCommand = (
  removed: boolean,
): ImportFileResultCommand => ({
  haptic: removed ? "success" : "error",
});

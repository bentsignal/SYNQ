import { getImportFileCommandErrorMessage } from "./import-file-command-service";
import type {
  ImportFileCommandDispatch,
  ImportFileCommandFlowDependencies,
} from "./import-file-command-flow-service";
import {
  getBeginFilePickAction,
  getFailImportSessionAction,
  getReviewImportSongsAction,
} from "./import-session-action-service";

export const runImportFileSelectionCommand = async ({
  dependencies,
  dispatch,
}: {
  dependencies: ImportFileCommandFlowDependencies;
  dispatch: ImportFileCommandDispatch;
}) => {
  dispatch(getBeginFilePickAction());

  try {
    const { drafts, skipped } = await dependencies.selectImportFiles();

    if (drafts.length === 0) {
      dispatch(
        getFailImportSessionAction(
          skipped > 0
            ? "No selected songs could be staged for import."
            : "File selection was cancelled.",
        ),
      );
      return false;
    }

    dispatch(getReviewImportSongsAction(drafts));
    return true;
  } catch (caughtError) {
    dispatch(
      getFailImportSessionAction(
        getImportFileCommandErrorMessage({
          caughtError,
          mutation: "select-files",
        }),
      ),
    );
    return false;
  }
};

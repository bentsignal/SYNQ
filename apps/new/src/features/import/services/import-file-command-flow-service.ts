import { getImportFileCommandErrorMessage } from "./import-file-command-service";
import {
  getBeginFilePickAction,
  getFailImportSessionAction,
  getRemoveImportSongsAction,
  getReviewImportSongsAction,
} from "./import-session-action-service";
import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

type ImportFileCommandDispatch = (action: ImportSessionAction) => void;

export type ImportFileCommandFlowDependencies = {
  deleteImportDraftCacheFiles: (songs: ImportSongDraft[]) => Promise<void>;
  selectImportFiles: () => Promise<{
    drafts: ImportSongDraft[];
    skipped: number;
  }>;
};

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

export const runImportFileRemovalCommand = async ({
  dependencies,
  dispatch,
  songIds,
  songs,
}: {
  dependencies: ImportFileCommandFlowDependencies;
  dispatch: ImportFileCommandDispatch;
  songIds: number[];
  songs: ImportSongDraft[];
}) => {
  const songIdSet = new Set(songIds);
  const songsToRemove = songs.filter((song) => songIdSet.has(song.id));

  try {
    await dependencies.deleteImportDraftCacheFiles(songsToRemove);
    dispatch(getRemoveImportSongsAction(songIds));
    return true;
  } catch (caughtError) {
    dispatch(
      getFailImportSessionAction(
        getImportFileCommandErrorMessage({
          caughtError,
          mutation: "remove-staged-songs",
        }),
      ),
    );
    return false;
  }
};

import { getImportFileCommandErrorMessage } from "./import-file-command-service";
import type {
  ImportFileCommandDispatch,
  ImportFileCommandFlowDependencies,
} from "./import-file-command-flow-service";
import {
  getFailImportSessionAction,
  getRemoveImportSongsAction,
} from "./import-session-action-service";
import type { ImportSongDraft } from "../types/import-session";

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

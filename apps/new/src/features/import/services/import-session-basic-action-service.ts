import type { ImportSessionAction } from "./import-session-action-types-service";
import type { ImportSongDraft } from "../types/import-session";

export const getBeginFilePickAction = (): ImportSessionAction => ({
  type: "begin-file-pick",
});

export const getFailImportSessionAction = (
  error: string,
): ImportSessionAction => ({
  error,
  type: "fail",
});

export const getReviewImportSongsAction = (
  songs: ImportSongDraft[],
): ImportSessionAction => ({
  songs,
  type: "review",
});

export const getRemoveImportSongsAction = (
  songIds: number[],
): ImportSessionAction => ({
  songIds,
  type: "remove-songs",
});

export const getSetImportSaveToLibraryAction = (
  shouldSaveToLibrary: boolean,
): ImportSessionAction => ({
  shouldSaveToLibrary,
  type: "set-save-to-library",
});

export const getUpdateImportSongAction = (
  song: ImportSongDraft,
): ImportSessionAction => ({
  song,
  type: "update-song",
});

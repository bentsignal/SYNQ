import type { ImportSessionAction } from "./import-session-state-service";
import type { ImportSongDraft } from "../types/import-session";

export const getBeginFilePickAction = (): ImportSessionAction => ({
  type: "begin-file-pick",
});

export const getBeginWifiTransferAction = (
  total: number,
): ImportSessionAction => ({
  total,
  type: "begin-wifi-transfer",
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

export const getReceiveWifiSongAction = (
  song: ImportSongDraft,
): ImportSessionAction => ({
  song,
  type: "receive-wifi-song",
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

export const getFinishWifiTransferAction = (
  songs: ImportSongDraft[],
): ImportSessionAction =>
  songs.length > 0
    ? { songs, type: "review" }
    : { error: "No Wi-Fi songs were received.", type: "fail" };

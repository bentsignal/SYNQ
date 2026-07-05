import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";

export type ImportSessionAction =
  | { type: "begin-file-pick" }
  | { total: number; type: "begin-wifi-transfer" }
  | { error: string; type: "fail" }
  | { songs: ImportSongDraft[]; type: "review" }
  | { song: ImportSongDraft; type: "receive-wifi-song" }
  | { songIds: number[]; type: "remove-songs" }
  | { shouldSaveToLibrary: boolean; type: "set-save-to-library" }
  | { song: ImportSongDraft; type: "update-song" }
  | { summary: ImportSaveSummary; type: "finish" }
  | { state: ImportSessionState; type: "hydrate" }
  | { type: "saving" }
  | { type: "discard" }
  | { type: "reset" };

export type ImportSessionHydrateAction = Extract<
  ImportSessionAction,
  { type: "hydrate" }
>;

export const getHydrateImportSessionAction = (
  state: ImportSessionState,
): ImportSessionHydrateAction => ({
  state,
  type: "hydrate",
});

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

export const getSavingImportSessionAction = (): ImportSessionAction => ({
  type: "saving",
});

export const getFinishWifiTransferAction = (
  songs: ImportSongDraft[],
): ImportSessionAction =>
  songs.length > 0
    ? { songs, type: "review" }
    : { error: "No Wi-Fi songs were received.", type: "fail" };

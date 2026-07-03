import type {
  ImportSaveSummary,
  ImportSessionState,
  ImportSongDraft,
} from "../types/import-session";
import { initialImportSessionState } from "./import-session-initial-state-service";
import {
  beginImportFilePick,
  beginImportWifiTransfer,
  discardImportSession,
  failImportSession,
  finishImportSession,
  receiveImportWifiSong,
  removeImportSongs,
  reviewImportSongs,
  setImportSaveToLibrary,
  startImportSessionSave,
  updateImportSong,
} from "./import-session-step-service";

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

export const importSessionReducer = (
  state: ImportSessionState,
  action: ImportSessionAction,
): ImportSessionState => {
  switch (action.type) {
    case "begin-file-pick":
      return beginImportFilePick(state);
    case "begin-wifi-transfer":
      return beginImportWifiTransfer({ state, total: action.total });
    case "fail":
      return failImportSession({ error: action.error, state });
    case "receive-wifi-song":
      return receiveImportWifiSong({ song: action.song, state });
    case "review":
      return reviewImportSongs({ songs: action.songs, state });
    case "remove-songs":
      return removeImportSongs({ songIds: action.songIds, state });
    case "set-save-to-library":
      return setImportSaveToLibrary({
        shouldSaveToLibrary: action.shouldSaveToLibrary,
        state,
      });
    case "update-song":
      return updateImportSong({ song: action.song, state });
    case "saving":
      return startImportSessionSave(state);
    case "finish":
      return finishImportSession({ state, summary: action.summary });
    case "hydrate":
      return action.state;
    case "discard":
      return discardImportSession();
    case "reset":
      return initialImportSessionState;
  }
};

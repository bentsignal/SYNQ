import type { ImportSessionState } from "../types/import-session";
import type { ImportSessionAction } from "./import-session-action-service";
import { initialImportSessionState } from "./import-session-initial-state-service";
import {
  beginImportFilePick,
  failImportSession,
} from "./import-session-step-service";
import {
  beginImportWifiTransfer,
  receiveImportWifiSong,
} from "./import-session-wifi-step-service";
import {
  removeImportSongs,
  reviewImportSongs,
  updateImportSong,
} from "./import-session-song-step-service";
import {
  discardImportSession,
  finishImportSession,
  setImportSaveToLibrary,
  startImportSessionSave,
} from "./import-session-save-step-service";

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

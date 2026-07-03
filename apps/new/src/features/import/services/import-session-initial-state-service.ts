import type { ImportSessionState } from "../types/import-session";

export const initialImportSessionState: ImportSessionState = {
  error: null,
  phase: "idle",
  progress: {
    current: 0,
    total: 0,
  },
  saveSummary: null,
  selectedSongId: null,
  shouldSaveToLibrary: true,
  songs: [],
  source: "files",
};

import type {
  ImportSaveSummary,
  ImportSessionState,
} from "../types/import-session";
import { initialImportSessionState } from "./import-session-initial-state-service";

export const setImportSaveToLibrary = ({
  shouldSaveToLibrary,
  state,
}: {
  shouldSaveToLibrary: boolean;
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  shouldSaveToLibrary,
});

export const startImportSessionSave = (
  state: ImportSessionState,
): ImportSessionState => ({
  ...state,
  error: null,
  phase: state.shouldSaveToLibrary ? "saving" : "discarding",
  progress: {
    current: 0,
    total: state.songs.length,
  },
});

export const finishImportSession = ({
  state,
  summary,
}: {
  state: ImportSessionState;
  summary: ImportSaveSummary;
}): ImportSessionState => {
  const total = summary.saved + summary.discarded;

  return {
    ...state,
    error: null,
    phase: "success",
    progress: {
      current: total,
      total,
    },
    saveSummary: summary,
  };
};

export const discardImportSession = (): ImportSessionState => ({
  ...initialImportSessionState,
  phase: "idle",
});

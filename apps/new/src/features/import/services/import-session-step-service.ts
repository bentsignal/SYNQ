import type { ImportSessionState } from "../types/import-session";

export const beginImportFilePick = (
  state: ImportSessionState,
): ImportSessionState => ({
  ...state,
  error: null,
  phase: "picking",
  source: "files",
});

export const failImportSession = ({
  error,
  state,
}: {
  error: string;
  state: ImportSessionState;
}): ImportSessionState => ({
  ...state,
  error,
  phase: "failure",
});

import type { ImportSessionState } from "../types/import-session";
import {
  getImportHomeHref,
  getImportSaveHref,
} from "./import-navigation-service";
import {
  getImportSongPreviewEmptyState,
  getImportSongPreviewListState,
} from "./import-song-preview-state-service";

export const getImportFilesActionState = (state: ImportSessionState) => {
  const isWorking = state.phase === "picking" || state.phase === "processing";

  return {
    chooseLabel: isWorking ? "Choosing" : "Choose songs",
    canChooseFiles: !isWorking,
    isWorking,
  };
};

export const getImportFilesActionLinks = () => [
  {
    href: getImportSaveHref(),
    label: "Review save",
  },
  {
    href: getImportHomeHref(),
    label: "Back to import",
  },
] as const;

export const getImportFilesViewState = (state: ImportSessionState) => ({
  actionLinks: getImportFilesActionLinks(),
  actionState: getImportFilesActionState(state),
  songPreviewEmptyState: getImportSongPreviewEmptyState(),
  songPreviewListState: getImportSongPreviewListState({
    songs: state.songs,
  }),
});

export type ImportFilesViewState = ReturnType<typeof getImportFilesViewState>;

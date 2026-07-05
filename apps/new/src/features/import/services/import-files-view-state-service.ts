import type { ImportSessionState } from "../types/import-session";
import { getImportFilesActionState } from "./import-files-action-state-service";
import { getImportFilesActionLinks } from "./import-files-navigation-state-service";
import {
  getImportSongPreviewEmptyState,
  getImportSongPreviewListState,
} from "./import-song-preview-state-service";

export const getImportFilesViewState = (state: ImportSessionState) => ({
  actionLinks: getImportFilesActionLinks(),
  actionState: getImportFilesActionState(state),
  songPreviewEmptyState: getImportSongPreviewEmptyState(),
  songPreviewListState: getImportSongPreviewListState({
    songs: state.songs,
  }),
});

export type ImportFilesViewState = ReturnType<typeof getImportFilesViewState>;

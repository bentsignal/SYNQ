import type { ImportSessionState } from "../types/import-session";
import { getImportSaveActionState } from "./import-save-action-state-service";
import {
  getImportSaveBackLink,
  getImportSaveHeaderState,
  getImportSaveLibraryToggleState,
} from "./import-save-header-state-service";
import {
  getImportSongPreviewEmptyState,
  getImportSongPreviewListState,
} from "./import-song-preview-state-service";

export const getImportSaveViewState = ({
  isExporting,
  state,
}: {
  isExporting: boolean;
  state: ImportSessionState;
}) => ({
  actionState: getImportSaveActionState({ isExporting, state }),
  backLink: getImportSaveBackLink(),
  headerState: getImportSaveHeaderState(),
  libraryToggleState: getImportSaveLibraryToggleState(),
  songPreviewEmptyState: getImportSongPreviewEmptyState(),
  songPreviewListState: getImportSongPreviewListState({
    songs: state.songs,
  }),
});

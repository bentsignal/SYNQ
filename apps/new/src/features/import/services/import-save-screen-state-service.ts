import type { ImportSessionState } from "../types/import-session";
import { getImportFilesHref } from "./import-navigation-service";
import { getImportSongPreviewEmptyState } from "./import-song-preview-state-service";

export const getImportSaveActionState = ({
  isExporting,
  state,
}: {
  isExporting: boolean;
  state: ImportSessionState;
}) => {
  const hasSongs = state.songs.length > 0;
  const isWorking =
    state.phase === "saving" || state.phase === "discarding" || isExporting;

  return {
    canDiscard: !isWorking,
    canExport: hasSongs && !isWorking,
    canFinish: hasSongs && !isWorking,
    canRemoveSongs: hasSongs && !isWorking,
    discardLabel: "Discard",
    exportLabel: isExporting ? "Exporting" : "Export",
    finishLabel: isWorking ? "Finishing" : "Finish",
    hasSongs,
    isWorking,
  };
};

export type ImportSaveActionState = ReturnType<
  typeof getImportSaveActionState
>;

export const getImportSaveHeaderState = () => ({
  kicker: "Import review",
  subtitle: "Review staged songs before writing them to the library.",
  title: "Save",
});

export const getImportSaveLibraryToggleState = () => ({
  label: "Save to library",
});

export const getImportSaveBackLink = () => ({
  href: getImportFilesHref(),
  label: "Back to files",
});

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
});

export type ImportSaveHeaderState = ReturnType<
  typeof getImportSaveHeaderState
>;

export type ImportSaveLibraryToggleState = ReturnType<
  typeof getImportSaveLibraryToggleState
>;

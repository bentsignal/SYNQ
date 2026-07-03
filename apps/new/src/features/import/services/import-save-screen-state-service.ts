import type { ImportSessionState } from "../types/import-session";
import { getImportFilesHref } from "./import-navigation-service";

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

export const getImportSongPreviewEmptyState = () => ({
  body: "Choose songs to review them before saving.",
  title: "No songs staged",
});

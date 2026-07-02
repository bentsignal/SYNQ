import type { ImportSessionState } from "../types/import-session";

export type ImportHomeRoute = {
  description: string;
  href: ImportNavigationHref;
  label: string;
  metaLabel: string;
};

export type ImportNavigationHref =
  | "/premium"
  | "/(tabs)/import"
  | "/(tabs)/import/files"
  | "/(tabs)/import/wifi"
  | "/(tabs)/import/save"
  | "/(tabs)/import/success"
  | "/(tabs)/import/failure"
  | "/(tabs)/library";

export const getImportHomeHref = (): ImportNavigationHref => "/(tabs)/import";

export const getImportFilesHref = (): ImportNavigationHref =>
  "/(tabs)/import/files";

export const getImportSaveHref = (): ImportNavigationHref =>
  "/(tabs)/import/save";

export const getImportLibraryHref = (): ImportNavigationHref =>
  "/(tabs)/library";

export const getImportPremiumHref = (): ImportNavigationHref => "/premium";

export const getImportHomeState = ({
  premiumActive,
  state,
}: {
  premiumActive: boolean;
  state: ImportSessionState;
}) => {
  const importLocked = !premiumActive;

  return {
    importLocked,
    routes: [
      {
        description: "Select local audio and review staged songs.",
        href: importLocked ? getImportPremiumHref() : getImportFilesHref(),
        label: "Files",
        metaLabel: importLocked ? "Premium" : `${state.songs.length} staged`,
      },
      {
        description: "Receive audio from a browser on the same network.",
        href: importLocked ? getImportPremiumHref() : "/(tabs)/import/wifi",
        label: "Wi-Fi",
        metaLabel: importLocked
          ? "Premium"
          : state.source === "wifi"
            ? state.progress.current.toString()
            : "Local",
      },
      {
        description: "Finish or discard the current import session.",
        href: importLocked ? getImportPremiumHref() : getImportSaveHref(),
        label: "Save",
        metaLabel: importLocked ? "Premium" : state.phase,
      },
    ] satisfies ImportHomeRoute[],
  };
};

export type ImportHomeState = ReturnType<typeof getImportHomeState>;

export type ImportResultHref = ImportNavigationHref;

export const getImportFilesResultHref = (staged: boolean): ImportResultHref =>
  staged ? getImportSaveHref() : "/(tabs)/import/failure";

export const getImportFinishResultHref = (
  succeeded: boolean,
): ImportResultHref =>
  succeeded ? "/(tabs)/import/success" : "/(tabs)/import/failure";

export const getImportDiscardResultHref = (
  discarded: boolean,
): ImportResultHref =>
  discarded ? getImportHomeHref() : "/(tabs)/import/failure";

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

export const getImportSaveExportErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Staged songs could not be exported.";

export const getImportSuccessState = (state: ImportSessionState) => {
  const savedCount = state.saveSummary?.saved ?? 0;
  const discardedCount = state.saveSummary?.discarded ?? 0;

  return {
    librarySaveLabel: state.shouldSaveToLibrary
      ? `${savedCount} saved to library`
      : `${discardedCount} discarded`,
    processedLabel: `${state.progress.current} of ${state.progress.total} songs processed.`,
    showLibraryHint: savedCount > 0,
  };
};

export const getImportFailureState = (state: ImportSessionState) => ({
  errorLabel: state.error ?? "The import session could not continue.",
  phaseLabel: state.phase,
});

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

export const getImportWifiState = ({
  error,
  isReady,
  state,
}: {
  error: string | null;
  isReady: boolean;
  state: ImportSessionState;
}) => {
  const hasSongs = state.songs.length > 0;
  const isTransferring =
    state.source === "wifi" && state.phase === "processing";
  const progressLabel =
    state.progress.total > 0
      ? `${state.progress.current}/${state.progress.total} received`
      : "Waiting";
  const statusLabel = error
    ? "Server failed"
    : isReady
      ? isTransferring
        ? "Receiving files"
        : "Server ready"
      : "Starting server";

  return {
    canReviewSave: hasSongs,
    hasSongs,
    isTransferring,
    progressLabel,
    statusLabel,
  };
};

export const getImportWifiActionState = () => ({
  backLink: {
    href: getImportHomeHref(),
    label: "Back to import",
  },
  reviewSave: {
    href: getImportSaveHref(),
    label: "Review save",
  },
});

export const getImportPremiumGateState = ({
  active,
  error,
  phase,
}: {
  active: boolean;
  error: string | null;
  phase: "checking" | "failure" | "ready";
}) => ({
  canAccessImport: active,
  error,
  kicker: phase === "checking" ? "Checking premium" : "Premium import",
});

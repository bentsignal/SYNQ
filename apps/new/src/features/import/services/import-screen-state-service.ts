import type { ImportSessionState } from "../types/import-session";
import {
  getImportFilesHref,
  getImportHomeHref,
  getImportPremiumHref,
  getImportSaveHref,
  getImportWifiHref,
  type ImportNavigationHref,
} from "./import-navigation-service";

export type ImportHomeRoute = {
  description: string;
  href: ImportNavigationHref;
  label: string;
  metaLabel: string;
};

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
        href: importLocked ? getImportPremiumHref() : getImportWifiHref(),
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
  action: {
    href: getImportPremiumHref(),
    label: "Open Premium",
  },
  body: "Unlock file and Wi-Fi import before staging new songs.",
  canAccessImport: active,
  error,
  kicker: phase === "checking" ? "Checking premium" : "Premium import",
  title: "Import is a Premium feature",
});

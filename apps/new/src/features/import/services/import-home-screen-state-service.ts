import type { ImportSessionState } from "../types/import-session";
import {
  getImportFilesHref,
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
  return {
    importLocked: false,
    routes: [
      {
        description: "Select local audio and review staged songs.",
        href: getImportFilesHref(),
        label: "Files",
        metaLabel: premiumActive ? `${state.songs.length} staged` : "Free",
      },
      {
        description: "Receive audio from a browser on the same network.",
        href: getImportWifiHref(),
        label: "Wi-Fi",
        metaLabel: state.source === "wifi"
            ? state.progress.current.toString()
            : premiumActive
              ? "Local"
              : "Free",
      },
      {
        description: "Finish or discard the current import session.",
        href: getImportSaveHref(),
        label: "Save",
        metaLabel: premiumActive ? state.phase : "First song",
      },
    ] satisfies ImportHomeRoute[],
  };
};

export type ImportHomeState = ReturnType<typeof getImportHomeState>;

import type { ImportSessionState } from "../types/import-session";
import {
  getImportHomeHref,
  getImportSaveHref,
} from "./import-navigation-service";

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

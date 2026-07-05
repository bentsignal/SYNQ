import {
  getImportHomeHref,
  getImportSaveHref,
} from "./import-navigation-service";

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

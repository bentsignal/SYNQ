import { getImportFilesHref } from "./import-navigation-service";

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

export type ImportSaveHeaderState = ReturnType<
  typeof getImportSaveHeaderState
>;

export type ImportSaveLibraryToggleState = ReturnType<
  typeof getImportSaveLibraryToggleState
>;

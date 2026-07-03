export type ImportNavigationHref =
  | "/premium"
  | "/(tabs)/import"
  | "/(tabs)/import/files"
  | "/(tabs)/import/wifi"
  | "/(tabs)/import/export"
  | "/(tabs)/import/save"
  | "/(tabs)/import/success"
  | "/(tabs)/import/failure"
  | "/(tabs)/library";

export const getImportHomeHref = (): ImportNavigationHref => "/(tabs)/import";

export const getImportFilesHref = (): ImportNavigationHref =>
  "/(tabs)/import/files";

export const getImportWifiHref = (): ImportNavigationHref =>
  "/(tabs)/import/wifi";

export const getImportSaveHref = (): ImportNavigationHref =>
  "/(tabs)/import/save";

export const getImportExportHref = (): ImportNavigationHref =>
  "/(tabs)/import/export";

export const getImportLibraryHref = (): ImportNavigationHref =>
  "/(tabs)/library";

export const getImportPremiumHref = (): ImportNavigationHref => "/premium";

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

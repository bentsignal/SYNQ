import * as Sharing from "expo-sharing";

export const sanitizeExportFileName = (value: string) =>
  value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "song";

export const getExportFileNameFromPath = (path: string, fallback: string) => {
  const rawName = decodeURIComponent(path.split("/").filter(Boolean).at(-1) ?? "");

  return sanitizeExportFileName(rawName || fallback);
};

export const assertSharingAvailable = async () => {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is unavailable on this device.");
  }
};

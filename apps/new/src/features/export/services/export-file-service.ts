import * as Sharing from "expo-sharing";

export {
  getExportFileNameFromPath,
  sanitizeExportFileName,
} from "./export-file-name-service";

export const assertSharingAvailable = async () => {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is unavailable on this device.");
  }
};

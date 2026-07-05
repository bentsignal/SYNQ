import { getExportFileNameFromPath } from "./export-file-name-service";
import type { ShareExportFile } from "./share-export-files-types-service";

export const getShareExportFileName = (
  file: ShareExportFile,
  index: number,
) =>
  `${index + 1}-${getExportFileNameFromPath(
    file.sourceUri,
    `${index + 1}-${file.fileNameFallback}`,
  )}`;

import type { ImportFileSelectionAsset } from "./import-file-selection-executor-service";

export const getCachedImportFileProcessParams = <
  Asset extends ImportFileSelectionAsset,
>({
  asset,
  destination,
  fileName,
  id,
}: {
  asset: Asset;
  destination: string;
  fileName: string;
  id: number;
}) => ({
  cacheUri: destination,
  fileName,
  fileType: asset.mimeType ?? fileName,
  id,
});

export const getWifiImportFileProcessParams = ({
  destination,
  fileName,
  id,
  type,
}: {
  destination: string;
  fileName: string;
  id: number;
  type: string;
}) => ({
  cacheUri: destination,
  fileName,
  fileType: type || fileName,
  id,
});

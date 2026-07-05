import type { ImportSongDraft } from "../types/import-session";

export type ImportFileSelectionAsset = {
  mimeType?: string | null;
  name: string | null | undefined;
  uri: string;
};

export type ImportFileSelectionResult<Asset extends ImportFileSelectionAsset> =
  | {
      canceled: true;
    }
  | {
      assets: Asset[];
      canceled: false;
    };

export type ImportFileSelectionDependencies<
  Asset extends ImportFileSelectionAsset = ImportFileSelectionAsset,
> = {
  copyAssetToImportCache: ({
    asset,
    index,
  }: {
    asset: Asset;
    index: number;
  }) => Promise<{ destination: string; fileName: string }>;
  createImportCacheDirectory: () => Promise<void>;
  now: () => number;
  pickImportFiles: () => Promise<ImportFileSelectionResult<Asset>>;
  processCachedImportFile: ({
    cacheUri,
    fileName,
    fileType,
    id,
  }: {
    cacheUri: string;
    fileName: string;
    fileType: string;
    id: number;
  }) => Promise<ImportSongDraft>;
  writeBase64AssetToImportCache: ({
    data,
    id,
    name,
  }: {
    data: string;
    id: number;
    name: string;
  }) => Promise<{ destination: string; fileName: string }>;
};

export type StageWifiImportFileParams = {
  data: string;
  id: number;
  name: string;
  type: string;
};


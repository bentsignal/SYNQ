import type { ImportSongDraft } from "../types/import-session";
import {
  getWifiImportFileProcessParams,
} from "./import-file-selection-step-service";
import { processImportAssetWithDependencies } from "./import-file-selection-operation-service";

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

export async function selectImportFilesWithDependencies<
  Asset extends ImportFileSelectionAsset,
>(
  dependencies: ImportFileSelectionDependencies<Asset>,
): Promise<{
  drafts: ImportSongDraft[];
  skipped: number;
}> {
  const result = await dependencies.pickImportFiles();

  if (result.canceled) {
    return {
      drafts: [],
      skipped: 0,
    };
  }

  await dependencies.createImportCacheDirectory();

  const drafts: ImportSongDraft[] = [];
  let skipped = 0;

  for (let index = 0; index < result.assets.length; index += 1) {
    const asset = result.assets[index];
    try {
      drafts.push(
        await processImportAssetWithDependencies({
          asset,
          dependencies,
          index,
        }),
      );
    } catch {
      skipped += 1;
    }
  }

  return {
    drafts,
    skipped,
  };
}

export async function stageWifiImportFileWithDependencies<
  Asset extends ImportFileSelectionAsset,
>(
  { data, id, name, type }: StageWifiImportFileParams,
  dependencies: ImportFileSelectionDependencies<Asset>,
) {
  const { destination, fileName } =
    await dependencies.writeBase64AssetToImportCache({
      data,
      id,
      name,
    });

  return dependencies.processCachedImportFile(
    getWifiImportFileProcessParams({
      destination,
      fileName,
      id,
      type,
    }),
  );
}

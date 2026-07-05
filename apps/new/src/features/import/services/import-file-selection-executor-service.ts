import type { ImportSongDraft } from "../types/import-session";
import { getWifiImportFileProcessParams } from "./import-file-selection-step-service";
import { processImportAssetsWithDependencies } from "./import-file-selection-operation-service";
import type {
  ImportFileSelectionAsset,
  ImportFileSelectionDependencies,
  StageWifiImportFileParams,
} from "./import-file-selection-types-service";

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

  return processImportAssetsWithDependencies({
    assets: result.assets,
    dependencies,
  });
}

export type {
  ImportFileSelectionAsset,
  ImportFileSelectionDependencies,
  ImportFileSelectionResult,
  StageWifiImportFileParams,
} from "./import-file-selection-types-service";

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

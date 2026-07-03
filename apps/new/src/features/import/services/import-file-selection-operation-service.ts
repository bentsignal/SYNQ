import type { ImportSongDraft } from "../types/import-session";
import type {
  ImportFileSelectionAsset,
  ImportFileSelectionDependencies,
} from "./import-file-selection-executor-service";
import { getCachedImportFileProcessParams } from "./import-file-selection-step-service";

export const processImportAssetWithDependencies = async <
  Asset extends ImportFileSelectionAsset,
>({
  asset,
  dependencies,
  index,
}: {
  asset: Asset;
  dependencies: ImportFileSelectionDependencies<Asset>;
  index: number;
}): Promise<ImportSongDraft> => {
  const { destination, fileName } = await dependencies.copyAssetToImportCache({
    asset,
    index,
  });

  return dependencies.processCachedImportFile(
    getCachedImportFileProcessParams({
      asset,
      destination,
      fileName,
      id: dependencies.now() + index,
    }),
  );
};

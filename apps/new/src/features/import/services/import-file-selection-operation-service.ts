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

export const processImportAssetsWithDependencies = async <
  Asset extends ImportFileSelectionAsset,
>({
  assets,
  dependencies,
}: {
  assets: Asset[];
  dependencies: ImportFileSelectionDependencies<Asset>;
}): Promise<{
  drafts: ImportSongDraft[];
  skipped: number;
}> => {
  const drafts: ImportSongDraft[] = [];
  let skipped = 0;

  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
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
};

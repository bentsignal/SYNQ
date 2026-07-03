import { supportedAudioFileTypes } from "@synq/audio";
import * as DocumentPicker from "expo-document-picker";
import type { ImportSongDraft } from "../types/import-session";
import {
  copyAssetToImportCache,
  createImportCacheDirectory,
  writeBase64AssetToImportCache,
} from "./import-file-cache-service";
import { processCachedImportFile } from "./import-song-draft-service";

const processImportAsset = async ({
  asset,
  index,
}: {
  asset: DocumentPicker.DocumentPickerAsset;
  index: number;
}): Promise<ImportSongDraft> => {
  const { destination, fileName } = await copyAssetToImportCache({
    asset,
    index,
  });

  return processCachedImportFile({
    cacheUri: destination,
    fileName,
    fileType: asset.mimeType ?? fileName,
    id: Date.now() + index,
  });
};

export async function selectImportFiles(): Promise<{
  drafts: ImportSongDraft[];
  skipped: number;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
    type: supportedAudioFileTypes,
  });

  if (result.canceled) {
    return {
      drafts: [],
      skipped: 0,
    };
  }

  await createImportCacheDirectory();

  const drafts: ImportSongDraft[] = [];
  let skipped = 0;

  for (let index = 0; index < result.assets.length; index += 1) {
    const asset = result.assets[index];
    try {
      drafts.push(await processImportAsset({ asset, index }));
    } catch {
      skipped += 1;
    }
  }

  return {
    drafts,
    skipped,
  };
}

export async function stageWifiImportFile({
  data,
  id,
  name,
  type,
}: {
  data: string;
  id: number;
  name: string;
  type: string;
}) {
  const { destination, fileName } = await writeBase64AssetToImportCache({
    data,
    id,
    name,
  });

  return processCachedImportFile({
    cacheUri: destination,
    fileName,
    fileType: type || fileName,
    id,
  });
}

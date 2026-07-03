import { supportedAudioFileTypes } from "@synq/audio";
import * as DocumentPicker from "expo-document-picker";
import type { ImportSongDraft } from "../types/import-session";
import {
  copyAssetToImportCache,
  createImportCacheDirectory,
  writeBase64AssetToImportCache,
} from "./import-file-cache-service";
import {
  selectImportFilesWithDependencies,
  stageWifiImportFileWithDependencies,
  type ImportFileSelectionDependencies,
} from "./import-file-selection-executor-service";
import { processCachedImportFile } from "./import-song-draft-service";

const importFileSelectionDependencies: ImportFileSelectionDependencies<DocumentPicker.DocumentPickerAsset> = {
  copyAssetToImportCache,
  createImportCacheDirectory,
  now: Date.now,
  pickImportFiles: () =>
    DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: supportedAudioFileTypes,
    }),
  processCachedImportFile,
  writeBase64AssetToImportCache,
};

export async function selectImportFiles(): Promise<{
  drafts: ImportSongDraft[];
  skipped: number;
}> {
  return selectImportFilesWithDependencies(importFileSelectionDependencies);
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
  return stageWifiImportFileWithDependencies(
    {
      data,
      id,
      name,
      type,
    },
    importFileSelectionDependencies,
  );
}

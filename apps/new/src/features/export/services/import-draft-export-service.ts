import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ImportSongDraft } from "@/src/features/import/types/import-session";
import {
  assertSharingAvailable,
  getExportFileNameFromPath,
} from "./export-file-service";

export async function shareImportDraftSongs(songs: ImportSongDraft[]) {
  await assertSharingAvailable();

  if (songs.length === 0) {
    throw new Error("No staged songs are available to export.");
  }

  if (songs.length === 1) {
    await Sharing.shareAsync(songs[0].cacheUri);
    return {
      exported: 1,
    };
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  const exportDirectory = `${FileSystem.cacheDirectory}synq-import-export-${Date.now()}`;
  await FileSystem.makeDirectoryAsync(exportDirectory, { intermediates: true });

  try {
    for (let index = 0; index < songs.length; index += 1) {
      const song = songs[index];
      const fileName = getExportFileNameFromPath(
        song.cacheUri,
        `${index + 1}-${song.fileName || song.title}`,
      );

      await FileSystem.copyAsync({
        from: song.cacheUri,
        to: `${exportDirectory}/${index + 1}-${fileName}`,
      });
    }

    await Sharing.shareAsync(exportDirectory);

    return {
      exported: songs.length,
    };
  } finally {
    await FileSystem.deleteAsync(exportDirectory, { idempotent: true });
  }
}

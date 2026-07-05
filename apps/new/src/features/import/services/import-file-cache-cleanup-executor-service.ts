import type { ImportSongDraft } from "../types/import-session";
import type { ImportFileCacheDependencies } from "./import-file-cache-dependencies-service";
import { getImportFileCacheErrorMessage } from "./import-file-cache-error-service";
import { getImportCacheDirectory } from "./import-file-cache-step-service";

export async function clearImportCacheWithDependencies(
  dependencies: ImportFileCacheDependencies,
) {
  try {
    await dependencies.deletePath(getImportCacheDirectory(dependencies), {
      idempotent: true,
    });
  } catch (error) {
    throw new Error(
      `Import cache cleanup failed: ${getImportFileCacheErrorMessage(error)}`,
    );
  }
}

export async function deleteImportDraftCacheFilesWithDependencies({
  dependencies,
  songs,
}: {
  dependencies: ImportFileCacheDependencies;
  songs: ImportSongDraft[];
}) {
  try {
    await Promise.all(
      songs.map((song) =>
        dependencies.deletePath(song.cacheUri, { idempotent: true }),
      ),
    );
  } catch (error) {
    throw new Error(
      `Import file cleanup failed: ${getImportFileCacheErrorMessage(error)}`,
    );
  }
}

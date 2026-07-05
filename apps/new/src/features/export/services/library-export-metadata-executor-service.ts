import type { LibraryExportArtworkDependencies } from "./library-export-artwork-service";
import {
  loadLibrarySongExportMetadataWithDependencies,
  type LibraryExportMetadataLoaderDependencies,
} from "./library-export-metadata-loader-service";
import {
  writeLibrarySongExportMetadataWithDependencies,
  type LibraryExportWritebackDependencies,
} from "./library-export-writeback-service";

export {
  buildLibraryExportAudioTags,
} from "./library-export-audio-tag-service";
export {
  loadArtworkTagWithDependencies,
  type LibraryExportArtworkDependencies,
  type LibraryExportArtworkTag,
} from "./library-export-artwork-service";
export {
  buildLibrarySongExportMetadata,
  formatLibraryExportNames,
  type LibraryExportMetadata,
} from "./library-export-metadata-builder-service";
export {
  loadLibrarySongExportMetadataWithDependencies,
  type LibraryExportMetadataLoaderDependencies,
} from "./library-export-metadata-loader-service";

export type LibraryExportMetadataSong = {
  id: number;
  pathToFile: string;
};

export type LibraryExportMetadataDependencies = LibraryExportArtworkDependencies & {
  isLibrarySongSnapshotStale: (songId: number) => Promise<boolean | null>;
} & LibraryExportMetadataLoaderDependencies &
  LibraryExportWritebackDependencies;

export const prepareLibrarySongForExportWithDependencies = async (
  song: LibraryExportMetadataSong,
  dependencies: LibraryExportMetadataDependencies,
) => {
  const stale = await dependencies.isLibrarySongSnapshotStale(song.id);

  if (stale !== true) {
    return song.pathToFile;
  }

  const metadata = await loadLibrarySongExportMetadataWithDependencies(
    song.id,
    dependencies,
  );
  if (!metadata?.pathToFile) {
    return song.pathToFile;
  }

  await writeLibrarySongExportMetadataWithDependencies({
    dependencies,
    metadata: {
      ...metadata,
      pathToFile: metadata.pathToFile,
    },
    songId: song.id,
  });

  return metadata.pathToFile;
};

import type { AudioMetadataTags } from "@synq/audio";
import {
  loadArtworkTagWithDependencies,
  type LibraryExportArtworkDependencies,
} from "./library-export-artwork-service";
import { buildLibraryExportAudioTags } from "./library-export-audio-tag-service";
import type { LibraryExportMetadata } from "./library-export-metadata-builder-service";

type LibraryExportWritableMetadata = LibraryExportMetadata & {
  pathToFile: string;
};

export type LibraryExportWritebackDependencies =
  LibraryExportArtworkDependencies & {
    markLibrarySongAsExported: (songId: number) => Promise<void>;
    writeTags: (params: {
      filePath: string;
      fileType: string | null;
      tags: AudioMetadataTags;
    }) => Promise<unknown>;
  };

export const writeLibrarySongExportMetadataWithDependencies = async ({
  dependencies,
  metadata,
  songId,
}: {
  dependencies: LibraryExportWritebackDependencies;
  metadata: LibraryExportWritableMetadata;
  songId: number;
}) => {
  const artwork = await loadArtworkTagWithDependencies(
    metadata.coverImage,
    dependencies,
  );
  const tags = buildLibraryExportAudioTags({ artwork, metadata });

  try {
    await dependencies.writeTags({
      filePath: metadata.pathToFile,
      fileType: metadata.fileType,
      tags,
    });
    await dependencies.markLibrarySongAsExported(songId);
  } catch {
    // Export should still share the playable file when metadata writeback fails.
  }
};

import type { AudioMetadataTags } from "@synq/audio";
import type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";
import {
  loadArtworkTagWithDependencies,
  type LibraryExportArtworkDependencies,
} from "./library-export-artwork-service";
import { buildLibraryExportAudioTags } from "./library-export-audio-tag-service";
import {
  buildLibrarySongExportMetadata,
} from "./library-export-metadata-builder-service";

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

export type LibraryExportMetadataSong = {
  id: number;
  pathToFile: string;
};

export type LibraryExportMetadataDependencies = LibraryExportArtworkDependencies & {
  isLibrarySongSnapshotStale: (songId: number) => Promise<boolean | null>;
  loadAlbumRows: (songId: number) => Promise<LibraryExportAlbumMetadataRow[]>;
  loadArtistRows: (songId: number) => Promise<LibraryExportArtistMetadataRow[]>;
  loadSongRow: (
    songId: number,
  ) => Promise<LibraryExportSongMetadataRow | null>;
  markLibrarySongAsExported: (songId: number) => Promise<void>;
  writeTags: (params: {
    filePath: string;
    fileType: string | null;
    tags: AudioMetadataTags;
  }) => Promise<unknown>;
};

export const loadLibrarySongExportMetadataWithDependencies = async (
  songId: number,
  dependencies: Pick<
    LibraryExportMetadataDependencies,
    "loadAlbumRows" | "loadArtistRows" | "loadSongRow"
  >,
) => {
  const song = await dependencies.loadSongRow(songId);

  if (!song) {
    return null;
  }

  const [artists, albums] = await Promise.all([
    dependencies.loadArtistRows(songId),
    dependencies.loadAlbumRows(songId),
  ]);

  return buildLibrarySongExportMetadata({ albums, artists, song });
};

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
    await dependencies.markLibrarySongAsExported(song.id);
  } catch {
    // Export should still share the playable file when metadata writeback fails.
  }

  return metadata.pathToFile;
};

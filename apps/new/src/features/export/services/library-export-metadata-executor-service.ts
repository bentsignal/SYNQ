import type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";
import type { LibraryExportArtworkDependencies } from "./library-export-artwork-service";
import {
  buildLibrarySongExportMetadata,
} from "./library-export-metadata-builder-service";
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
} & LibraryExportWritebackDependencies;

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

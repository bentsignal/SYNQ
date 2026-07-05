import type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";
import {
  buildLibrarySongExportMetadata,
} from "./library-export-metadata-builder-service";

export type LibraryExportMetadataLoaderDependencies = {
  loadAlbumRows: (songId: number) => Promise<LibraryExportAlbumMetadataRow[]>;
  loadArtistRows: (songId: number) => Promise<LibraryExportArtistMetadataRow[]>;
  loadSongRow: (
    songId: number,
  ) => Promise<LibraryExportSongMetadataRow | null>;
};

export const loadLibrarySongExportMetadataWithDependencies = async (
  songId: number,
  dependencies: LibraryExportMetadataLoaderDependencies,
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

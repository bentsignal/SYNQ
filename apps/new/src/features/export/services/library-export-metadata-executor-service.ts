import type { AudioMetadataTags } from "@synq/audio";
import type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";

export type LibraryExportMetadataSong = {
  id: number;
  pathToFile: string;
};

export type LibraryExportMetadata = {
  album: string;
  artist: string;
  coverImage: string | null;
  fileType: string | null;
  pathToFile: string | null;
  title: string;
};

export type LibraryExportArtworkTag = {
  description: "Album Cover";
  imageBuffer: string;
  mime: "image/jpeg";
};

export type LibraryExportMetadataDependencies = {
  getImagePathFromHash: (hash: string) => { pathToFullImage: string };
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  isLibrarySongSnapshotStale: (songId: number) => Promise<boolean | null>;
  loadAlbumRows: (songId: number) => Promise<LibraryExportAlbumMetadataRow[]>;
  loadArtistRows: (songId: number) => Promise<LibraryExportArtistMetadataRow[]>;
  loadSongRow: (
    songId: number,
  ) => Promise<LibraryExportSongMetadataRow | null>;
  markLibrarySongAsExported: (songId: number) => Promise<void>;
  readAsString: (
    path: string,
    options: { encoding: "base64" },
  ) => Promise<string>;
  writeTags: (params: {
    filePath: string;
    fileType: string | null;
    tags: AudioMetadataTags;
  }) => Promise<unknown>;
};

export const formatLibraryExportNames = (names: string[]) =>
  names
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second))
    .join(", ");

export const buildLibrarySongExportMetadata = ({
  albums,
  artists,
  song,
}: {
  albums: LibraryExportAlbumMetadataRow[];
  artists: LibraryExportArtistMetadataRow[];
  song: LibraryExportSongMetadataRow;
}): LibraryExportMetadata => ({
  album: formatLibraryExportNames(albums.flatMap((album) => album.name ?? [])),
  artist: formatLibraryExportNames(
    artists.flatMap((artist) => artist.name ?? []),
  ),
  coverImage:
    song.coverImage ??
    albums.find((album) => album.coverImage !== null)?.coverImage ??
    null,
  fileType: song.fileType,
  pathToFile: song.pathToFile,
  title: song.title ?? "Untitled song",
});

export const loadArtworkTagWithDependencies = async (
  coverImage: string | null,
  dependencies: Pick<
    LibraryExportMetadataDependencies,
    "getImagePathFromHash" | "getInfo" | "readAsString"
  >,
): Promise<LibraryExportArtworkTag | null> => {
  if (!coverImage) {
    return null;
  }

  const { pathToFullImage } = dependencies.getImagePathFromHash(coverImage);
  const fileInfo = await dependencies.getInfo(pathToFullImage);

  if (!fileInfo.exists) {
    return null;
  }

  return {
    description: "Album Cover",
    imageBuffer: await dependencies.readAsString(pathToFullImage, {
      encoding: "base64",
    }),
    mime: "image/jpeg",
  };
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

  const tags: AudioMetadataTags = {
    album: metadata.album,
    artist: metadata.artist,
    title: metadata.title,
  };
  const artwork = await loadArtworkTagWithDependencies(
    metadata.coverImage,
    dependencies,
  );
  if (artwork) {
    tags.APIC = artwork;
  }

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

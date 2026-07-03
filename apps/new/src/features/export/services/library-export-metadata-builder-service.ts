import type {
  LibraryExportAlbumMetadataRow,
  LibraryExportArtistMetadataRow,
  LibraryExportSongMetadataRow,
} from "../repository/library-export-metadata-repository";

export type LibraryExportMetadata = {
  album: string;
  artist: string;
  coverImage: string | null;
  fileType: string | null;
  pathToFile: string | null;
  title: string;
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

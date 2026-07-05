export type LibraryExportSongMetadataRow = {
  coverImage: string | null;
  fileType: string | null;
  pathToFile: string | null;
  title: string | null;
};

export type LibraryExportArtistMetadataRow = {
  name: string | null;
};

export type LibraryExportAlbumMetadataRow = {
  coverImage: string | null;
  name: string | null;
};

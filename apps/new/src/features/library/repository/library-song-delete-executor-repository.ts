export type LibrarySongDeleteDependencies = {
  deleteAlbumSongRows: (songId: number) => Promise<void>;
  deleteArtistSongRows: (songId: number) => Promise<void>;
  deleteLibrarySongFiles: (songId: number) => Promise<void>;
  deletePlaylistSongRows: (songId: number) => Promise<void>;
  deleteSongRow: (songId: number) => Promise<void>;
  documentDirectory: string | null;
};

export const getLibrarySongDirectoryPath = ({
  documentDirectory,
  songId,
}: {
  documentDirectory: string;
  songId: number;
}) => `${documentDirectory}library/${songId}`;

export async function deleteLibrarySongWithDependencies(
  songId: number,
  dependencies: LibrarySongDeleteDependencies,
) {
  await dependencies.deleteAlbumSongRows(songId);
  await dependencies.deleteArtistSongRows(songId);
  await dependencies.deletePlaylistSongRows(songId);
  await dependencies.deleteSongRow(songId);

  if (dependencies.documentDirectory) {
    await dependencies.deleteLibrarySongFiles(songId);
  }
}

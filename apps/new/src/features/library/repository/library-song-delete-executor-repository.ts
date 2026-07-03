export type LibrarySongDeleteRowDependencies = {
  deleteAlbumSongRows: (songId: number) => Promise<void>;
  deleteArtistSongRows: (songId: number) => Promise<void>;
  deletePlaylistSongRows: (songId: number) => Promise<void>;
  deleteSongRow: (songId: number) => Promise<void>;
};

export async function deleteLibrarySongRowsWithDependencies(
  songId: number,
  dependencies: LibrarySongDeleteRowDependencies,
) {
  await dependencies.deleteAlbumSongRows(songId);
  await dependencies.deleteArtistSongRows(songId);
  await dependencies.deletePlaylistSongRows(songId);
  await dependencies.deleteSongRow(songId);
}

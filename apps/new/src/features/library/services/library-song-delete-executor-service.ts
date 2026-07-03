export type LibrarySongDeleteDependencies = {
  deleteLibrarySongFiles: (songId: number) => Promise<void>;
  deleteLibrarySongRows: (songId: number) => Promise<void>;
};

export async function deleteLibrarySongWithDependencies(
  songId: number,
  dependencies: LibrarySongDeleteDependencies,
) {
  await dependencies.deleteLibrarySongRows(songId);
  await dependencies.deleteLibrarySongFiles(songId);
}

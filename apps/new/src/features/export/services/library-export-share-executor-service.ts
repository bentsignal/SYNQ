export type ExportableLibrarySong = {
  id: number;
  pathToFile: string | null;
  title: string;
};

export type PlayableLibraryExportSong = ExportableLibrarySong & {
  pathToFile: string;
};

export type LibraryExportShareDependencies = {
  assertSharingAvailable: () => Promise<void>;
  prepareLibrarySongForExport: (
    song: PlayableLibraryExportSong,
  ) => Promise<string>;
  shareExportFiles: (params: {
    directoryPrefix: string;
    files: { fileNameFallback: string; sourceUri: string }[];
    noFilesMessage: string;
  }) => Promise<{ exported: number }>;
};

export const getPlayableLibraryExportSongs = (songs: ExportableLibrarySong[]) =>
  songs.filter(
    (song): song is PlayableLibraryExportSong => song.pathToFile !== null,
  );

export async function shareLibrarySongsWithDependencies(
  songs: ExportableLibrarySong[],
  dependencies: LibraryExportShareDependencies,
) {
  await dependencies.assertSharingAvailable();

  const files = await Promise.all(
    getPlayableLibraryExportSongs(songs).map(async (song) => ({
      fileNameFallback: song.title,
      sourceUri: await dependencies.prepareLibrarySongForExport(song),
    })),
  );

  return dependencies.shareExportFiles({
    directoryPrefix: "synq-export",
    files,
    noFilesMessage: "No playable songs are available to export.",
  });
}

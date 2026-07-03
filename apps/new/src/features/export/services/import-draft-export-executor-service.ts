import type { ImportSongDraft } from "../../import/types/import-session";

export type ImportDraftExportDependencies = {
  assertSharingAvailable: () => Promise<void>;
  shareExportFiles: (params: {
    directoryPrefix: string;
    files: { fileNameFallback: string; sourceUri: string }[];
    noFilesMessage: string;
  }) => Promise<{ exported: number }>;
};

export const getImportDraftExportFiles = (songs: ImportSongDraft[]) =>
  songs.map((song) => ({
    fileNameFallback: song.fileName || song.title,
    sourceUri: song.cacheUri,
  }));

export async function shareImportDraftSongsWithDependencies(
  songs: ImportSongDraft[],
  dependencies: ImportDraftExportDependencies,
) {
  await dependencies.assertSharingAvailable();

  return dependencies.shareExportFiles({
    directoryPrefix: "synq-import-export",
    files: getImportDraftExportFiles(songs),
    noFilesMessage: "No staged songs are available to export.",
  });
}

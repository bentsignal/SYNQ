import type { ImportSongDraft } from "../types/import-session";

export type ImportDraftExistenceDependencies = {
  getInfo: (path: string) => Promise<{ exists: boolean }>;
};

export const filterExistingImportDraftsWithDependencies = async ({
  dependencies,
  songs,
}: {
  dependencies: ImportDraftExistenceDependencies;
  songs: ImportSongDraft[];
}) => {
  const existingSongs: ImportSongDraft[] = [];

  for (const song of songs) {
    const fileInfo = await dependencies.getInfo(song.cacheUri);
    if (fileInfo.exists) {
      existingSongs.push(song);
    }
  }

  return existingSongs;
};

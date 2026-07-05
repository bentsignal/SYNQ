import { getLibrarySongExportSnapshotInput } from "./library-song-export-snapshot-input-repository";
import type { LibrarySongExportSnapshotDependencies } from "./library-song-export-snapshot-types-repository";

export const getLibrarySongSnapshotHashWithDependencies = async (
  songId: number,
  dependencies: LibrarySongExportSnapshotDependencies,
) => {
  const song = await dependencies.loadSongRow(songId);

  if (!song) {
    throw new Error(`Song ${songId} not found.`);
  }

  const [albums, artists] = await Promise.all([
    dependencies.loadAlbumRows(songId),
    dependencies.loadArtistRows(songId),
  ]);

  return dependencies.digestSnapshot(
    getLibrarySongExportSnapshotInput({ albums, artists, song }),
  );
};

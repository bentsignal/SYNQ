import { getLibrarySongSnapshotHashWithDependencies } from "./library-song-export-snapshot-hash-repository";
import type { LibrarySongExportSnapshotDependencies } from "./library-song-export-snapshot-types-repository";

export const isLibrarySongSnapshotStaleWithDependencies = async (
  songId: number,
  dependencies: LibrarySongExportSnapshotDependencies,
) => {
  const snapshotAtLastExport =
    await dependencies.loadSnapshotAtLastExport(songId);

  if (snapshotAtLastExport === undefined) {
    return null;
  }

  if (!snapshotAtLastExport) {
    return true;
  }

  return (
    (await getLibrarySongSnapshotHashWithDependencies(songId, dependencies)) !==
    snapshotAtLastExport
  );
};

export const markLibrarySongAsExportedWithDependencies = async (
  songId: number,
  dependencies: LibrarySongExportSnapshotDependencies,
) => {
  const snapshotAtLastExport =
    await getLibrarySongSnapshotHashWithDependencies(songId, dependencies);

  await dependencies.updateSnapshotAtLastExport({
    snapshotAtLastExport,
    songId,
  });
};

export { getLibrarySongExportSnapshotInput } from "./library-song-export-snapshot-input-repository";
export { getLibrarySongSnapshotHashWithDependencies } from "./library-song-export-snapshot-hash-repository";
export type {
  LibrarySongExportSnapshotAlbumRow,
  LibrarySongExportSnapshotArtistRow,
  LibrarySongExportSnapshotDependencies,
  LibrarySongExportSnapshotSongRow,
} from "./library-song-export-snapshot-types-repository";

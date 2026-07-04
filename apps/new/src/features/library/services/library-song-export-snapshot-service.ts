import {
  isLibrarySongSnapshotStale,
  markLibrarySongAsExported,
} from "../repository/library-song-export-snapshot-repository";

export const isLibrarySongExportSnapshotStale = (songId: number) =>
  isLibrarySongSnapshotStale(songId);

export const markLibrarySongExportSnapshot = (songId: number) =>
  markLibrarySongAsExported(songId);

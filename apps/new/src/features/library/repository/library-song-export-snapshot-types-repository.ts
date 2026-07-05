export type LibrarySongExportSnapshotSongRow = {
  coverImage: string | null;
  duration: number | null;
  fileType: string | null;
  snapshotAtLastExport: string | null;
  title: string | null;
};

export type LibrarySongExportSnapshotAlbumRow = {
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export type LibrarySongExportSnapshotArtistRow = {
  name: string | null;
};

export type LibrarySongExportSnapshotDependencies = {
  digestSnapshot: (input: string) => Promise<string>;
  loadAlbumRows: (
    songId: number,
  ) => Promise<LibrarySongExportSnapshotAlbumRow[]>;
  loadArtistRows: (
    songId: number,
  ) => Promise<LibrarySongExportSnapshotArtistRow[]>;
  loadSongRow: (
    songId: number,
  ) => Promise<LibrarySongExportSnapshotSongRow | null>;
  loadSnapshotAtLastExport: (songId: number) => Promise<string | null | undefined>;
  updateSnapshotAtLastExport: ({
    snapshotAtLastExport,
    songId,
  }: {
    snapshotAtLastExport: string;
    songId: number;
  }) => Promise<void>;
};

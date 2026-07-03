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

export const getLibrarySongExportSnapshotInput = ({
  albums,
  artists,
  song,
}: {
  albums: LibrarySongExportSnapshotAlbumRow[];
  artists: LibrarySongExportSnapshotArtistRow[];
  song: LibrarySongExportSnapshotSongRow;
}) => {
  const albumNames = albums
    .map(
      (album) =>
        `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`,
    )
    .sort()
    .join(",");
  const artistNames = artists
    .map((artist) => artist.name ?? "")
    .sort()
    .join(",");

  return [
    song.title,
    song.duration,
    song.fileType,
    song.coverImage,
    artistNames,
    albumNames,
  ].join("-");
};

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

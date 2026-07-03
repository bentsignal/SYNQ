const unknownArtistLabels = new Set(["", "unknown", "unknown artist"]);

export type AlbumArtistUpdateDependencies = {
  deleteAlbumArtistRows: (albumId: number) => Promise<void>;
  findArtistIdByName: (name: string) => Promise<number | null>;
  insertAlbumArtistRows: (
    rows: { albumId: number; artistId: number }[],
  ) => Promise<void>;
  insertArtist: (name: string) => Promise<number>;
};

export const normalizeAlbumArtistName = (name: string) => name.trim();

export const splitAlbumArtistNames = (value: string) =>
  value
    .split(",")
    .map(normalizeAlbumArtistName)
    .filter((name) => !unknownArtistLabels.has(name.toLowerCase()));

const ensureArtistWithDependencies = async (
  name: string,
  dependencies: Pick<
    AlbumArtistUpdateDependencies,
    "findArtistIdByName" | "insertArtist"
  >,
) => {
  const cleanName = normalizeAlbumArtistName(name);
  const existingId = await dependencies.findArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertArtist(cleanName);
};

export const replaceAlbumArtistsWithDependencies = async (
  {
    albumId,
    artistNames,
  }: {
    albumId: number;
    artistNames: string;
  },
  dependencies: AlbumArtistUpdateDependencies,
) => {
  const artistIds = new Set<number>();

  for (const artistName of splitAlbumArtistNames(artistNames)) {
    artistIds.add(await ensureArtistWithDependencies(artistName, dependencies));
  }

  await dependencies.deleteAlbumArtistRows(albumId);

  if (artistIds.size === 0) {
    return;
  }

  await dependencies.insertAlbumArtistRows(
    Array.from(artistIds).map((artistId) => ({
      albumId,
      artistId,
    })),
  );
};

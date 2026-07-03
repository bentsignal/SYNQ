const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);

export type SongMetadataRelationshipDependencies = {
  deleteAlbumSongRows: (songId: number) => Promise<void>;
  deleteArtistSongRows: (songId: number) => Promise<void>;
  findAlbumArtistLinkId: (params: {
    albumId: number;
    artistId: number;
  }) => Promise<number | null>;
  findAlbumIdByName: (name: string) => Promise<number | null>;
  findArtistIdByName: (name: string) => Promise<number | null>;
  insertAlbum: (name: string) => Promise<number>;
  insertAlbumArtistRows: (
    rows: { albumId: number; artistId: number }[],
  ) => Promise<void>;
  insertAlbumSongRows: (
    rows: { albumId: number; songId: number }[],
  ) => Promise<void>;
  insertArtist: (name: string) => Promise<number>;
  insertArtistSongRows: (
    rows: { artistId: number; songId: number }[],
  ) => Promise<void>;
};

export const normalizeSongMetadataRelationshipName = (name: string) =>
  name.trim();

const hasMeaningfulRelationshipName = (name: string) =>
  !unknownLabels.has(normalizeSongMetadataRelationshipName(name).toLowerCase());

export const splitSongMetadataRelationshipNames = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map(normalizeSongMetadataRelationshipName)
        .filter(hasMeaningfulRelationshipName),
    ),
  );

const ensureArtistWithDependencies = async (
  name: string,
  dependencies: Pick<
    SongMetadataRelationshipDependencies,
    "findArtistIdByName" | "insertArtist"
  >,
) => {
  const cleanName = normalizeSongMetadataRelationshipName(name);
  const existingId = await dependencies.findArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertArtist(cleanName);
};

const ensureAlbumWithDependencies = async (
  name: string,
  dependencies: Pick<
    SongMetadataRelationshipDependencies,
    "findAlbumIdByName" | "insertAlbum"
  >,
) => {
  const cleanName = normalizeSongMetadataRelationshipName(name);
  const existingId = await dependencies.findAlbumIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertAlbum(cleanName);
};

const ensureAlbumArtistLinksWithDependencies = async (
  {
    albumIds,
    artistIds,
  }: {
    albumIds: number[];
    artistIds: number[];
  },
  dependencies: Pick<
    SongMetadataRelationshipDependencies,
    "findAlbumArtistLinkId" | "insertAlbumArtistRows"
  >,
) => {
  const rows: { albumId: number; artistId: number }[] = [];

  for (const albumId of albumIds) {
    for (const artistId of artistIds) {
      const existingId = await dependencies.findAlbumArtistLinkId({
        albumId,
        artistId,
      });

      if (existingId === null) {
        rows.push({ albumId, artistId });
      }
    }
  }

  if (rows.length > 0) {
    await dependencies.insertAlbumArtistRows(rows);
  }
};

export async function replaceLibrarySongMetadataRelationshipsWithDependencies(
  {
    albumNames,
    artistNames,
    songId,
  }: {
    albumNames: string;
    artistNames: string;
    songId: number;
  },
  dependencies: SongMetadataRelationshipDependencies,
) {
  const artistIds: number[] = [];
  const albumIds: number[] = [];

  await dependencies.deleteArtistSongRows(songId);
  await dependencies.deleteAlbumSongRows(songId);

  for (const artistName of splitSongMetadataRelationshipNames(artistNames)) {
    artistIds.push(await ensureArtistWithDependencies(artistName, dependencies));
  }

  for (const albumName of splitSongMetadataRelationshipNames(albumNames)) {
    albumIds.push(await ensureAlbumWithDependencies(albumName, dependencies));
  }

  if (artistIds.length > 0) {
    await dependencies.insertArtistSongRows(
      artistIds.map((artistId) => ({ artistId, songId })),
    );
  }

  if (albumIds.length > 0) {
    await dependencies.insertAlbumSongRows(
      albumIds.map((albumId) => ({ albumId, songId })),
    );
  }

  await ensureAlbumArtistLinksWithDependencies(
    { albumIds, artistIds },
    dependencies,
  );

  return {
    albumIds,
    artistIds,
  };
}

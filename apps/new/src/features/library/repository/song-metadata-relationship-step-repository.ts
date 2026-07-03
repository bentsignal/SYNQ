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

export const ensureSongMetadataArtist = async (
  name: string,
  dependencies: Pick<
    SongMetadataRelationshipDependencies,
    "findArtistIdByName" | "insertArtist"
  >,
) => {
  const cleanName = name.trim();
  const existingId = await dependencies.findArtistIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertArtist(cleanName);
};

export const ensureSongMetadataAlbum = async (
  name: string,
  dependencies: Pick<
    SongMetadataRelationshipDependencies,
    "findAlbumIdByName" | "insertAlbum"
  >,
) => {
  const cleanName = name.trim();
  const existingId = await dependencies.findAlbumIdByName(cleanName);

  if (existingId !== null) {
    return existingId;
  }

  return dependencies.insertAlbum(cleanName);
};

export const ensureSongMetadataAlbumArtistLinks = async (
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

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  replaceAlbumArtistsWithDependencies,
  type AlbumArtistUpdateDependencies,
} from "./album-artist-update-executor-repository";

const albumArtistUpdateDependencies: AlbumArtistUpdateDependencies = {
  deleteAlbumArtistRows: async (albumId) => {
    await db
      .delete(schema.artistsAlbums)
      .where(eq(schema.artistsAlbums.albumId, albumId));
  },
  findArtistIdByName: async (name) => {
    const existing = await db
      .select({ id: schema.artists.id })
      .from(schema.artists)
      .where(eq(schema.artists.name, name))
      .limit(1);

    return existing[0]?.id ?? null;
  },
  insertAlbumArtistRows: async (rows) => {
    await db.insert(schema.artistsAlbums).values(rows);
  },
  insertArtist: async (name) => {
    const inserted = await db
      .insert(schema.artists)
      .values({ name })
      .returning({ id: schema.artists.id });

    return inserted[0].id;
  },
};

export const replaceAlbumArtists = async ({
  albumId,
  artistNames,
}: {
  albumId: number;
  artistNames: string;
}) => {
  await replaceAlbumArtistsWithDependencies(
    { albumId, artistNames },
    albumArtistUpdateDependencies,
  );
};

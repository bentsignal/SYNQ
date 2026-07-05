import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export const findSongMetadataArtistIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

export const insertSongMetadataArtist = async (name: string) => {
  const inserted = await db
    .insert(schema.artists)
    .values({ name })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

export const findSongMetadataAlbumIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

export const insertSongMetadataAlbum = async (name: string) => {
  const inserted = await db
    .insert(schema.albums)
    .values({ name })
    .returning({ id: schema.albums.id });

  return inserted[0].id;
};

export const findSongMetadataAlbumArtistLinkId = async ({
  albumId,
  artistId,
}: {
  albumId: number;
  artistId: number;
}) => {
  const existing = await db
    .select({ id: schema.artistsAlbums.id })
    .from(schema.artistsAlbums)
    .where(
      and(
        eq(schema.artistsAlbums.albumId, albumId),
        eq(schema.artistsAlbums.artistId, artistId),
      ),
    )
    .limit(1);

  return existing[0]?.id ?? null;
};

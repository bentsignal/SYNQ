import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const findImportLibraryArtistIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

export const insertImportLibraryArtist = async (name: string) => {
  const inserted = await db
    .insert(schema.artists)
    .values({ name })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

export const findImportLibraryAlbumIdByName = async (name: string) => {
  const existing = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, name))
    .limit(1);

  return existing[0]?.id ?? null;
};

export const insertImportLibraryAlbum = async (name: string) => {
  const inserted = await db
    .insert(schema.albums)
    .values({ name })
    .returning({ id: schema.albums.id });

  return inserted[0].id;
};

export const updateImportLibraryAlbumCover = async ({
  albumId,
  coverImage,
}: {
  albumId: number;
  coverImage: string;
}) => {
  await db
    .update(schema.albums)
    .set({ coverImage })
    .where(eq(schema.albums.id, albumId));
};

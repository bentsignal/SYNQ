import { saveCoverImage } from "@/src/features/images/repository/image-repository";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

const assertUniqueArtistName = async (name: string) => {
  const existingArtist = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, name))
    .limit(1);

  if (existingArtist.length > 0) {
    throw new Error("Artist already exists");
  }
};

const assertUniquePlaylistName = async (name: string) => {
  const existingPlaylist = await db
    .select({ id: schema.playlists.id })
    .from(schema.playlists)
    .where(eq(schema.playlists.name, name))
    .limit(1);

  if (existingPlaylist.length > 0) {
    throw new Error("Playlist already exists");
  }
};

const assertUniqueAlbumName = async (name: string) => {
  const existingAlbum = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, name))
    .limit(1);

  if (existingAlbum.length > 0) {
    throw new Error("Album already exists");
  }
};

export const createLibraryArtist = async (name: string, image?: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Artist name is required");
  }

  await assertUniqueArtistName(cleanName);

  const profileImage = await saveCoverImage(image);
  const createdArtist = await db
    .insert(schema.artists)
    .values({
      name: cleanName,
      profileImage,
    })
    .returning({ id: schema.artists.id });

  return {
    id: createdArtist[0].id,
    name: cleanName,
  };
};

export const createLibraryPlaylist = async (name: string, image?: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Name is required");
  }

  await assertUniquePlaylistName(cleanName);

  const coverImage = await saveCoverImage(image);
  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({
      name: cleanName,
      coverImage,
    })
    .returning({ id: schema.playlists.id });

  return {
    id: createdPlaylist[0].id,
    name: cleanName,
  };
};

export const createLibraryAlbum = async (
  name: string,
  year?: number,
  image?: string,
) => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Album name is required");
  }

  await assertUniqueAlbumName(cleanName);

  const coverImage = await saveCoverImage(image);
  const createdAlbum = await db
    .insert(schema.albums)
    .values({
      name: cleanName,
      year,
      coverImage,
    })
    .returning({ id: schema.albums.id });

  return {
    id: createdAlbum[0].id,
    name: cleanName,
    year,
  };
};

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

export async function createAlbum({
  coverImage,
  name,
  year,
}: {
  coverImage?: string | null;
  name: string;
  year?: number;
}) {
  const cleanName = assertCollectionName({ kind: "album", name });

  await assertUniqueCollectionName({ kind: "album", name: cleanName });

  const createdAlbum = await db
    .insert(schema.albums)
    .values({
      coverImage: await saveCoverImage(coverImage),
      name: cleanName,
      year,
    })
    .returning({ id: schema.albums.id });

  const id = createdAlbum[0]?.id;

  if (!id) {
    throw new Error("Album could not be created.");
  }

  return {
    id,
    name: cleanName,
    year,
  };
}

export async function createArtist(name: string) {
  const cleanName = assertCollectionName({ kind: "artist", name });

  await assertUniqueCollectionName({ kind: "artist", name: cleanName });

  const createdArtist = await db
    .insert(schema.artists)
    .values({ name: cleanName })
    .returning({ id: schema.artists.id });

  const id = createdArtist[0]?.id;

  if (!id) {
    throw new Error("Artist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

export async function createArtistWithImage({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string | null;
}) {
  const cleanName = assertCollectionName({ kind: "artist", name });

  await assertUniqueCollectionName({ kind: "artist", name: cleanName });

  const createdArtist = await db
    .insert(schema.artists)
    .values({
      name: cleanName,
      profileImage: await saveCoverImage(profileImage),
    })
    .returning({ id: schema.artists.id });

  const id = createdArtist[0]?.id;

  if (!id) {
    throw new Error("Artist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

export async function createPlaylist({
  coverImage,
  name,
}: {
  coverImage?: string | null;
  name: string;
}) {
  const cleanName = assertCollectionName({ kind: "playlist", name });

  await assertUniqueCollectionName({ kind: "playlist", name: cleanName });

  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({
      coverImage: await saveCoverImage(coverImage),
      name: cleanName,
    })
    .returning({ id: schema.playlists.id });

  const id = createdPlaylist[0]?.id;

  if (!id) {
    throw new Error("Playlist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

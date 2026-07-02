import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import {
  assertCollectionName,
  type CollectionMetadataKind,
} from "../services/collection-metadata-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

type DeletableCollectionKind = CollectionMetadataKind;

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

export async function updateAlbum({
  coverImage,
  id,
  name,
  year,
}: {
  coverImage?: string | null;
  id: number;
  name: string;
  year?: number | null;
}) {
  const cleanName = assertCollectionName({ kind: "album", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "album",
    name: cleanName,
  });

  await db
    .update(schema.albums)
    .set({
      ...(coverImage !== undefined
        ? { coverImage: await saveCoverImage(coverImage) }
        : {}),
      name: cleanName,
      year,
    })
    .where(eq(schema.albums.id, id));

  return {
    id,
    name: cleanName,
    year,
  };
}

export async function updateArtist({
  id,
  name,
  profileImage,
}: {
  id: number;
  name: string;
  profileImage?: string | null;
}) {
  const cleanName = assertCollectionName({ kind: "artist", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "artist",
    name: cleanName,
  });

  await db
    .update(schema.artists)
    .set({
      ...(profileImage !== undefined
        ? { profileImage: await saveCoverImage(profileImage) }
        : {}),
      name: cleanName,
    })
    .where(eq(schema.artists.id, id));

  return {
    id,
    name: cleanName,
  };
}

export async function updatePlaylist({
  coverImage,
  id,
  name,
}: {
  coverImage?: string | null;
  id: number;
  name: string;
}) {
  const cleanName = assertCollectionName({ kind: "playlist", name });

  await assertUniqueCollectionName({
    excludeId: id,
    kind: "playlist",
    name: cleanName,
  });

  await db
    .update(schema.playlists)
    .set({
      ...(coverImage !== undefined
        ? { coverImage: await saveCoverImage(coverImage) }
        : {}),
      name: cleanName,
    })
    .where(eq(schema.playlists.id, id));

  return {
    id,
    name: cleanName,
  };
}

export async function deleteCollection({
  id,
  kind,
}: {
  id: number;
  kind: DeletableCollectionKind;
}) {
  switch (kind) {
    case "album":
      await db.delete(schema.albumSongs).where(eq(schema.albumSongs.albumId, id));
      await db
        .delete(schema.artistsAlbums)
        .where(eq(schema.artistsAlbums.albumId, id));
      await db.delete(schema.albums).where(eq(schema.albums.id, id));
      return;
    case "artist":
      await db
        .delete(schema.artistSongs)
        .where(eq(schema.artistSongs.artistId, id));
      await db
        .delete(schema.artistsAlbums)
        .where(eq(schema.artistsAlbums.artistId, id));
      await db.delete(schema.artists).where(eq(schema.artists.id, id));
      return;
    case "playlist":
      if (id === 1 || id === 2) {
        throw new Error("This system playlist cannot be deleted.");
      }

      await db
        .delete(schema.playlistSongs)
        .where(eq(schema.playlistSongs.playlistId, id));
      await db.delete(schema.playlists).where(eq(schema.playlists.id, id));
  }
}

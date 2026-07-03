import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { systemPlaylistId } from "../services/library-playlist-constants-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

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
  if (id === systemPlaylistId) {
    throw new Error("This system playlist cannot be edited.");
  }

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

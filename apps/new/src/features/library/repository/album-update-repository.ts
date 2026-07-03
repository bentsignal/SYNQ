import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { replaceAlbumArtists } from "./album-artist-update-repository";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

export async function updateAlbum({
  artistNames,
  coverImage,
  id,
  name,
  year,
}: {
  artistNames?: string;
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

  if (artistNames !== undefined) {
    await replaceAlbumArtists({ albumId: id, artistNames });
  }

  return {
    id,
    name: cleanName,
    year,
  };
}

import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  replaceLibrarySongMetadataRelationships,
} from "./song-metadata-relationship-repository";

export async function updateLibrarySongMetadata({
  albumNames,
  artistNames,
  coverImageDataUrl,
  id,
  title,
}: {
  albumNames: string;
  artistNames: string;
  coverImageDataUrl?: string | null;
  id: number;
  title: string;
}) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error("Song title is required.");
  }

  await db
    .update(schema.songs)
    .set({
      snapshotAtLastExport: null,
      title: cleanTitle,
    })
    .where(eq(schema.songs.id, id));

  const { albumIds } = await replaceLibrarySongMetadataRelationships({
    albumNames,
    artistNames,
    songId: id,
  });

  if (coverImageDataUrl !== undefined) {
    const coverImage = await saveCoverImage(coverImageDataUrl);

    if (!coverImage) {
      return;
    }

    const firstAlbumId = albumIds[0];

    if (firstAlbumId) {
      await db
        .update(schema.albums)
        .set({ coverImage })
        .where(eq(schema.albums.id, firstAlbumId));
      return;
    }

    await db
      .update(schema.songs)
      .set({ coverImage })
      .where(eq(schema.songs.id, id));
  }
}

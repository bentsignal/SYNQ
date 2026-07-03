import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import {
  replaceLibrarySongMetadataRelationships,
} from "./song-metadata-relationship-repository";
import {
  updateLibrarySongMetadataWithDependencies,
} from "./song-metadata-update-executor-repository";

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
  await updateLibrarySongMetadataWithDependencies(
    {
      albumNames,
      artistNames,
      coverImageDataUrl,
      id,
      title,
    },
    {
      replaceRelationships: replaceLibrarySongMetadataRelationships,
      saveCoverImage,
      updateAlbumCover: async ({ albumId, coverImage }) => {
        await db
          .update(schema.albums)
          .set({ coverImage })
          .where(eq(schema.albums.id, albumId));
      },
      updateSongCover: async ({ coverImage, songId }) => {
        await db
          .update(schema.songs)
          .set({ coverImage })
          .where(eq(schema.songs.id, songId));
      },
      updateSongTitle: async ({ songId, title }) => {
        await db
          .update(schema.songs)
          .set({
            snapshotAtLastExport: null,
            title,
          })
          .where(eq(schema.songs.id, songId));
      },
    },
  );
}

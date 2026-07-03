import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { replaceAlbumArtists } from "./album-artist-update-repository";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";
import {
  updateAlbumWithDependencies,
} from "./collection-update-executor-repository";

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
  return updateAlbumWithDependencies(
    {
      artistNames,
      coverImage,
      id,
      name,
      year,
    },
    {
      assertUniqueCollectionName,
      replaceAlbumArtists,
      saveCoverImage,
      updateAlbumRow: async ({ coverImage, id, name, year }) => {
        await db
          .update(schema.albums)
          .set({
            ...(coverImage !== undefined ? { coverImage } : {}),
            name,
            year,
          })
          .where(eq(schema.albums.id, id));
      },
    },
  );
}

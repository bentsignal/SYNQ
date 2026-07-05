import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";
import {
  updateArtistWithDependencies,
} from "./artist-update-executor-repository";

export async function updateArtist({
  id,
  name,
  profileImage,
}: {
  id: number;
  name: string;
  profileImage?: string | null;
}) {
  return updateArtistWithDependencies(
    {
      id,
      name,
      profileImage,
    },
    {
      assertUniqueCollectionName,
      saveCoverImage,
      updateArtistRow: async ({ id, name, profileImage }) => {
        await db
          .update(schema.artists)
          .set({
            ...(profileImage !== undefined ? { profileImage } : {}),
            name,
          })
          .where(eq(schema.artists.id, id));
      },
    },
  );
}

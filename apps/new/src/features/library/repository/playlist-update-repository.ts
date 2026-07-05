import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { isProtectedPlaylistId } from "../services/library-playlist-constants-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";
import {
  updatePlaylistWithDependencies,
} from "./playlist-update-executor-repository";

export async function updatePlaylist({
  coverImage,
  id,
  name,
}: {
  coverImage?: string | null;
  id: number;
  name: string;
}) {
  return updatePlaylistWithDependencies(
    {
      coverImage,
      id,
      name,
    },
    {
      assertUniqueCollectionName,
      isProtectedPlaylistId,
      saveCoverImage,
      updatePlaylistRow: async ({ coverImage, id, name }) => {
        await db
          .update(schema.playlists)
          .set({
            ...(coverImage !== undefined ? { coverImage } : {}),
            name,
          })
          .where(eq(schema.playlists.id, id));
      },
    },
  );
}

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { isProtectedPlaylistId } from "../services/library-playlist-constants-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

export async function updatePlaylist({
  coverImage,
  id,
  name,
}: {
  coverImage?: string | null;
  id: number;
  name: string;
}) {
  if (isProtectedPlaylistId(id)) {
    throw new Error("This protected playlist cannot be edited.");
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

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import { assertCollectionName } from "../services/collection-metadata-service";
import { assertUniqueCollectionName } from "./collection-uniqueness-repository";

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

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

export async function insertAlbumRow({
  coverImage,
  name,
  year,
}: {
  coverImage: string | null;
  name: string;
  year?: number;
}) {
  const createdAlbum = await db
    .insert(schema.albums)
    .values({
      coverImage,
      name,
      year,
    })
    .returning({ id: schema.albums.id });

  return createdAlbum[0]?.id ?? null;
}

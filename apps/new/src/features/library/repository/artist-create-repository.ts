import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

export async function insertArtistRow({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string | null;
}) {
  const createdArtist = await db
    .insert(schema.artists)
    .values({ name, profileImage })
    .returning({ id: schema.artists.id });

  return createdArtist[0]?.id ?? null;
}

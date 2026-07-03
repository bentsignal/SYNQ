import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

export async function insertPlaylistRow({
  coverImage,
  name,
}: {
  coverImage: string | null;
  name: string;
}) {
  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({
      coverImage,
      name,
    })
    .returning({ id: schema.playlists.id });

  return createdPlaylist[0]?.id ?? null;
}

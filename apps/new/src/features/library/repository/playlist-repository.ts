import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

const normalizePlaylistName = (name: string) => name.trim();

export async function createPlaylist(name: string) {
  const cleanName = normalizePlaylistName(name);

  if (!cleanName) {
    throw new Error("Playlist name is required.");
  }

  const existingPlaylists = await db.select().from(schema.playlists);
  const matchingPlaylist = existingPlaylists.find(
    (playlist) => playlist.name?.toLowerCase() === cleanName.toLowerCase(),
  );

  if (matchingPlaylist) {
    throw new Error("A playlist with this name already exists.");
  }

  const createdPlaylist = await db
    .insert(schema.playlists)
    .values({ name: cleanName })
    .returning({ id: schema.playlists.id });

  const id = createdPlaylist[0]?.id;

  if (!id) {
    throw new Error("Playlist could not be created.");
  }

  return {
    id,
    name: cleanName,
  };
}

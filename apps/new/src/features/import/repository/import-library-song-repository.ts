import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import type { ImportSongDraft } from "../types/import-session";

export const insertImportSongDraft = async (song: ImportSongDraft) => {
  const inserted = await db
    .insert(schema.songs)
    .values({
      duration: song.duration,
      fileType: song.fileType,
      ingestComplete: 1,
      originalFileName: song.fileName,
      pathToFile: song.cacheUri,
      title: song.title,
    })
    .returning({ id: schema.songs.id });

  return inserted[0].id;
};

export const updateImportLibrarySongCover = async ({
  coverImage,
  songId,
}: {
  coverImage: string;
  songId: number;
}) => {
  await db
    .update(schema.songs)
    .set({ coverImage })
    .where(eq(schema.songs.id, songId));
};

export const updateImportLibrarySongPath = async ({
  pathToFile,
  songId,
}: {
  pathToFile: string;
  songId: number;
}) => {
  await db
    .update(schema.songs)
    .set({ pathToFile })
    .where(eq(schema.songs.id, songId));
};

export const deleteImportLibrarySongRows = async (songId: number) => {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  await db.delete(schema.artistSongs).where(eq(schema.artistSongs.songId, songId));
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
  await db.delete(schema.songs).where(eq(schema.songs.id, songId));
};

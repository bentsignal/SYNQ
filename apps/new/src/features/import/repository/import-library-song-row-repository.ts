import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import type { ImportLibrarySongInsertValues } from "./import-library-song-executor-repository";

export const deleteImportLibrarySongRow = async (songId: number) => {
  await db.delete(schema.songs).where(eq(schema.songs.id, songId));
};

export const insertImportLibrarySongRow = async (
  values: ImportLibrarySongInsertValues,
) => {
  const inserted = await db
    .insert(schema.songs)
    .values(values)
    .returning({ id: schema.songs.id });

  return inserted[0].id;
};

export const updateImportLibrarySongRowCover = async ({
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

export const updateImportLibrarySongRowPath = async ({
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

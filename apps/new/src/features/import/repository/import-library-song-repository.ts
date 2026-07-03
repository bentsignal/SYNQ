import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import type { ImportSongDraft } from "../types/import-session";
import {
  deleteImportLibrarySongRowsWithDependencies,
  insertImportSongDraftWithDependencies,
  updateImportLibrarySongCoverWithDependencies,
  updateImportLibrarySongPathWithDependencies,
  type ImportLibrarySongRowDependencies,
} from "./import-library-song-executor-repository";

const importLibrarySongRowDependencies: ImportLibrarySongRowDependencies = {
  deleteAlbumSongRows: async (songId) => {
    await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  },
  deleteArtistSongRows: async (songId) => {
    await db
      .delete(schema.artistSongs)
      .where(eq(schema.artistSongs.songId, songId));
  },
  deletePlaylistSongRows: async (songId) => {
    await db
      .delete(schema.playlistSongs)
      .where(eq(schema.playlistSongs.songId, songId));
  },
  deleteSongRow: async (songId) => {
    await db.delete(schema.songs).where(eq(schema.songs.id, songId));
  },
  insertSongRow: async (values) => {
    const inserted = await db
      .insert(schema.songs)
      .values(values)
      .returning({ id: schema.songs.id });

    return inserted[0].id;
  },
  updateSongCover: async ({ coverImage, songId }) => {
    await db
      .update(schema.songs)
      .set({ coverImage })
      .where(eq(schema.songs.id, songId));
  },
  updateSongPath: async ({ pathToFile, songId }) => {
    await db
      .update(schema.songs)
      .set({ pathToFile })
      .where(eq(schema.songs.id, songId));
  },
};

export const insertImportSongDraft = async (song: ImportSongDraft) =>
  insertImportSongDraftWithDependencies(
    song,
    importLibrarySongRowDependencies,
  );

export const updateImportLibrarySongCover = async ({
  coverImage,
  songId,
}: {
  coverImage: string;
  songId: number;
}) => {
  await updateImportLibrarySongCoverWithDependencies(
    { coverImage, songId },
    importLibrarySongRowDependencies,
  );
};

export const updateImportLibrarySongPath = async ({
  pathToFile,
  songId,
}: {
  pathToFile: string;
  songId: number;
}) => {
  await updateImportLibrarySongPathWithDependencies(
    { pathToFile, songId },
    importLibrarySongRowDependencies,
  );
};

export const deleteImportLibrarySongRows = async (songId: number) => {
  await deleteImportLibrarySongRowsWithDependencies(
    songId,
    importLibrarySongRowDependencies,
  );
};

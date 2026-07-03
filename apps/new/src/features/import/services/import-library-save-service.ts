import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";
import { deleteImportDraftCacheFiles } from "./import-file-cache-service";
import {
  deleteLibrarySongFiles,
  moveImportAudioToLibrary,
} from "./import-library-file-service";
import { linkImportSongToLibrary } from "./import-library-link-service";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const insertSongDraft = async (song: ImportSongDraft) => {
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

const updateSongCover = async ({
  artwork,
  songId,
}: {
  artwork: string | null;
  songId: number;
}) => {
  const coverImage = await saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await db
    .update(schema.songs)
    .set({ coverImage })
    .where(eq(schema.songs.id, songId));
};

const deleteLibrarySong = async (songId: number) => {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  await db.delete(schema.artistSongs).where(eq(schema.artistSongs.songId, songId));
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
  await db.delete(schema.songs).where(eq(schema.songs.id, songId));
  await deleteLibrarySongFiles(songId);
};

const updateLibrarySongPath = async ({
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

const saveOneImportSong = async (song: ImportSongDraft) => {
  const songId = await insertSongDraft(song);

  try {
    const libraryPath = await moveImportAudioToLibrary({
      cacheUri: song.cacheUri,
      fileName: song.fileName,
      songId,
    });
    await updateLibrarySongPath({ pathToFile: libraryPath, songId });
  } catch (error) {
    await deleteLibrarySong(songId);
    throw new Error(`Audio file could not be saved: ${getErrorMessage(error)}`);
  }

  const { linkedAlbum } = await linkImportSongToLibrary({ song, songId });

  if (!linkedAlbum) {
    await updateSongCover({ artwork: song.artwork, songId });
  }

  return songId;
};

export async function saveImportSessionToLibrary(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  const savedSongIds: number[] = [];

  for (const song of songs) {
    savedSongIds.push(await saveOneImportSong(song));
  }

  return {
    discarded: 0,
    saved: savedSongIds.length,
    savedSongIds,
  };
}

export async function discardImportSession(
  songs: ImportSongDraft[],
): Promise<ImportSaveSummary> {
  await deleteImportDraftCacheFiles(songs);

  return {
    discarded: songs.length,
    saved: 0,
    savedSongIds: [],
  };
}

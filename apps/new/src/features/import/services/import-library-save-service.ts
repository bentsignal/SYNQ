import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";
import { deleteImportDraftCacheFiles } from "./import-file-service";
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

  if (FileSystem.documentDirectory) {
    await FileSystem.deleteAsync(
      `${FileSystem.documentDirectory}library/${songId}`,
      { idempotent: true },
    );
  }
};

const ensureLibraryDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}library`, {
    intermediates: true,
  });
};

const moveImportAudioToLibrary = async ({
  cacheUri,
  fileName,
  songId,
}: {
  cacheUri: string;
  fileName: string;
  songId: number;
}) => {
  await ensureLibraryDirectory();

  const songDirectory = `${FileSystem.documentDirectory}library/${songId}`;
  await FileSystem.makeDirectoryAsync(songDirectory, { intermediates: true });

  const destination = `${songDirectory}/${fileName}`;
  await FileSystem.copyAsync({
    from: cacheUri,
    to: destination,
  });
  await FileSystem.deleteAsync(cacheUri, { idempotent: true });

  return destination;
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

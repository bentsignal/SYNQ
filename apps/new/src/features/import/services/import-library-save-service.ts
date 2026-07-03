import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import {
  deleteImportLibrarySongRows,
  insertImportSongDraft,
  updateImportLibrarySongCover,
  updateImportLibrarySongPath,
} from "../repository/import-library-song-repository";
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

  await updateImportLibrarySongCover({ coverImage, songId });
};

const deleteLibrarySong = async (songId: number) => {
  await deleteImportLibrarySongRows(songId);
  await deleteLibrarySongFiles(songId);
};

const saveOneImportSong = async (song: ImportSongDraft) => {
  const songId = await insertImportSongDraft(song);

  try {
    const libraryPath = await moveImportAudioToLibrary({
      cacheUri: song.cacheUri,
      fileName: song.fileName,
      songId,
    });
    await updateImportLibrarySongPath({ pathToFile: libraryPath, songId });
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

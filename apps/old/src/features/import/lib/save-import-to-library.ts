import { SongType } from "@/src/constants/Types";
import {
  addArtistToLibraryAlbum,
  addSongToLibraryPlaylist,
  getLibraryAlbumCoverPath,
  LIBRARY_PLAYLIST_ID,
  updateLibraryAlbum,
} from "@/src/features/library/repository/library-entity-repository";
import {
  addAlbumToLibrarySong,
  addArtistToLibrarySong,
  createLibrarySongFromImport,
  deleteLibrarySong,
  updateLibrarySongFilePath,
} from "@/src/features/library/repository/library-song-repository";
import { updateLibrarySongCover } from "@/src/features/library/repository/song-metadata-repository";
import * as FileSystem from "expo-file-system";

type SaveImportSongResult =
  | { status: "saved"; songId: number }
  | { status: "skipped"; reason: "missing-file-path"; songId: number }
  | { status: "failed"; reason: "audio-write" | "insert"; message: string };

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getLibrarySongDirectory = (songId: number) => {
  return `${FileSystem.documentDirectory}library/${songId}`;
};

const ensureLibraryDirectory = async () => {
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}library`, {
    intermediates: true,
  });
};

const moveImportAudioToLibrary = async ({
  songId,
  cacheUri,
  fileName,
}: {
  songId: number;
  cacheUri: string;
  fileName: string;
}) => {
  await ensureLibraryDirectory();
  const songDirectory = getLibrarySongDirectory(songId);
  await FileSystem.makeDirectoryAsync(songDirectory, { intermediates: true });

  const destination = `${songDirectory}/${fileName}`;
  await FileSystem.copyAsync({
    from: cacheUri,
    to: destination,
  });
  await FileSystem.deleteAsync(cacheUri, { idempotent: true });

  return destination;
};

const storeImportSongAlbumRelations = async (
  song: SongType,
  librarySongId: number,
) => {
  const importAlbums = song.importAlbums ?? [];
  const importArtists = song.importArtists ?? [];

  for (const album of importAlbums) {
    await addAlbumToLibrarySong(album.id, librarySongId, song.track);

    for (const artist of importArtists) {
      await addArtistToLibraryAlbum(artist.id, album.id);
    }

    const albumCover = await getLibraryAlbumCoverPath(album.id);
    if (!albumCover && album.image) {
      await updateLibraryAlbum({
        id: album.id,
        image: album.image,
      });
    }
  }
};

const storeImportSongArtistRelations = async (
  song: SongType,
  librarySongId: number,
) => {
  const importArtists = song.importArtists ?? [];

  for (const artist of importArtists) {
    await addArtistToLibrarySong(artist.id, librarySongId);
  }
};

const saveOneImportSongToLibrary = async (
  song: SongType,
): Promise<SaveImportSongResult> => {
  const fileName = song.fileName;
  const cacheUri = song.cacheUri;

  if (!fileName || !cacheUri) {
    return {
      status: "skipped",
      reason: "missing-file-path",
      songId: song.id,
    };
  }

  const librarySongId = await createLibrarySongFromImport({
    title: song.title ?? "",
    duration: song.duration ?? 0,
    fileType: song.fileType ?? "",
    originalFileName: fileName,
    pathToFile: cacheUri,
  });

  try {
    const libraryPath = await moveImportAudioToLibrary({
      songId: librarySongId,
      cacheUri,
      fileName,
    });
    await updateLibrarySongFilePath(librarySongId, libraryPath);
  } catch (error) {
    await deleteLibrarySong(librarySongId);
    return {
      status: "failed",
      reason: "audio-write",
      message: getErrorMessage(error),
    };
  }

  await storeImportSongAlbumRelations(song, librarySongId);

  if ((song.importAlbums?.length ?? 0) === 0 && song.artwork) {
    await updateLibrarySongCover(librarySongId, song.artwork);
  }

  await addSongToLibraryPlaylist(LIBRARY_PLAYLIST_ID, librarySongId);
  await storeImportSongArtistRelations(song, librarySongId);

  return {
    status: "saved",
    songId: librarySongId,
  };
};

export const saveImportSongsToLibrary = async (
  songs: SongType[],
  progress: (value: number) => void,
) => {
  const results: SaveImportSongResult[] = [];

  try {
    for (let index = 0; index < songs.length; index += 1) {
      try {
        results.push(await saveOneImportSongToLibrary(songs[index]));
      } catch (error) {
        results.push({
          status: "failed",
          reason: "insert",
          message: getErrorMessage(error),
        });
      } finally {
        progress(index + 1);
      }
    }

    return results;
  } catch (error) {
    throw new Error("Error saving to library: " + getErrorMessage(error));
  }
};

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";
import { saveCoverImage } from "@/src/features/images/services/image-storage-service";
import type {
  ImportSaveSummary,
  ImportSongDraft,
} from "../types/import-session";

const libraryPlaylistId = 1;

const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const normalizeName = (name: string) => name.trim();

const hasMeaningfulName = (name: string) =>
  !unknownLabels.has(normalizeName(name).toLowerCase());

const splitNames = (value: string) =>
  value
    .split(",")
    .map(normalizeName)
    .filter(hasMeaningfulName);

const ensureArtist = async (name: string) => {
  const cleanName = normalizeName(name);
  const existing = await db
    .select({ id: schema.artists.id })
    .from(schema.artists)
    .where(eq(schema.artists.name, cleanName))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.artists)
    .values({ name: cleanName })
    .returning({ id: schema.artists.id });

  return inserted[0].id;
};

const ensureAlbum = async (name: string) => {
  const cleanName = normalizeName(name);
  const existing = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(eq(schema.albums.name, cleanName))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.albums)
    .values({ name: cleanName })
    .returning({ id: schema.albums.id });

  return inserted[0].id;
};

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

const updateAlbumCover = async ({
  albumId,
  artwork,
}: {
  albumId: number;
  artwork: string | null;
}) => {
  const coverImage = await saveCoverImage(artwork);

  if (!coverImage) {
    return;
  }

  await db
    .update(schema.albums)
    .set({ coverImage })
    .where(eq(schema.albums.id, albumId));
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

const linkSongToLibraryPlaylist = async (songId: number) => {
  await db.insert(schema.playlistSongs).values({
    playlistId: libraryPlaylistId,
    songId,
  });
};

const linkSongArtists = async ({
  artistNames,
  songId,
}: {
  artistNames: string[];
  songId: number;
}) => {
  const artistIds: number[] = [];

  for (const artistName of artistNames) {
    const artistId = await ensureArtist(artistName);
    artistIds.push(artistId);
    await db.insert(schema.artistSongs).values({
      artistId,
      songId,
    });
  }

  return artistIds;
};

const linkSongAlbum = async ({
  albumName,
  artistIds,
  song,
  songId,
}: {
  albumName: string;
  artistIds: number[];
  song: ImportSongDraft;
  songId: number;
}) => {
  if (!hasMeaningfulName(albumName)) {
    return false;
  }

  const albumId = await ensureAlbum(albumName);
  await db.insert(schema.albumSongs).values({
    albumId,
    songId,
    track: song.track,
  });
  await updateAlbumCover({ albumId, artwork: song.artwork });

  for (const artistId of artistIds) {
    await db.insert(schema.artistsAlbums).values({
      albumId,
      artistId,
    });
  }

  return true;
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

  const artistIds = await linkSongArtists({
    artistNames: splitNames(song.artist),
    songId,
  });

  const linkedAlbum = await linkSongAlbum({
    albumName: song.album,
    artistIds,
    song,
    songId,
  });

  if (!linkedAlbum) {
    await updateSongCover({ artwork: song.artwork, songId });
  }

  await linkSongToLibraryPlaylist(songId);

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
  return {
    discarded: songs.length,
    saved: 0,
    savedSongIds: [],
  };
}

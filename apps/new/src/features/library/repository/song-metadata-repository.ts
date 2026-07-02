import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";

const unknownLabels = new Set(["", "unknown", "unknown artist", "unknown album"]);
const likedSongsPlaylistId = 2;

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

const linkArtistToAlbum = async ({
  albumId,
  artistId,
}: {
  albumId: number;
  artistId: number;
}) => {
  const existing = await db
    .select({ id: schema.artistsAlbums.id })
    .from(schema.artistsAlbums)
    .where(
      and(
        eq(schema.artistsAlbums.albumId, albumId),
        eq(schema.artistsAlbums.artistId, artistId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(schema.artistsAlbums).values({ albumId, artistId });
};

const getNextLikedSongPosition = async () => {
  const rows = await db
    .select({ position: schema.playlistSongs.position })
    .from(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, likedSongsPlaylistId));
  const highestPosition = rows.reduce(
    (highest, row) => Math.max(highest, row.position ?? 0),
    0,
  );

  return highestPosition + 1;
};

export async function updateLibrarySongMetadata({
  albumNames,
  artistNames,
  id,
  title,
}: {
  albumNames: string;
  artistNames: string;
  id: number;
  title: string;
}) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error("Song title is required.");
  }

  const artistIds: number[] = [];
  const albumIds: number[] = [];

  await db
    .update(schema.songs)
    .set({
      snapshotAtLastExport: null,
      title: cleanTitle,
    })
    .where(eq(schema.songs.id, id));

  await db.delete(schema.artistSongs).where(eq(schema.artistSongs.songId, id));
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, id));

  for (const artistName of splitNames(artistNames)) {
    const artistId = await ensureArtist(artistName);
    artistIds.push(artistId);
    await db.insert(schema.artistSongs).values({ artistId, songId: id });
  }

  for (const albumName of splitNames(albumNames)) {
    const albumId = await ensureAlbum(albumName);
    albumIds.push(albumId);
    await db.insert(schema.albumSongs).values({ albumId, songId: id });
  }

  for (const albumId of albumIds) {
    for (const artistId of artistIds) {
      await linkArtistToAlbum({ albumId, artistId });
    }
  }
}

export async function setLibrarySongLiked({
  liked,
  songId,
}: {
  liked: boolean;
  songId: number;
}) {
  const existing = await db
    .select({ id: schema.playlistSongs.id })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, likedSongsPlaylistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    )
    .limit(1);

  if (liked) {
    if (existing.length > 0) {
      return;
    }

    await db.insert(schema.playlistSongs).values({
      playlistId: likedSongsPlaylistId,
      position: await getNextLikedSongPosition(),
      songId,
    });
    return;
  }

  await db
    .delete(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, likedSongsPlaylistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );
}

export async function deleteLibrarySong(songId: number) {
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
}

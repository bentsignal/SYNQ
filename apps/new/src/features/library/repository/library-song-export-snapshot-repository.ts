import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";

const getLibrarySongSnapshotHash = async (songId: number) => {
  const songRows = await db
    .select()
    .from(schema.songs)
    .where(eq(schema.songs.id, songId))
    .limit(1);
  const song = songRows[0];

  if (!song) {
    throw new Error(`Song ${songId} not found.`);
  }

  const albumsContainingSong = await db
    .select({
      coverImage: schema.albums.coverImage,
      name: schema.albums.name,
      year: schema.albums.year,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .where(eq(schema.albumSongs.songId, songId));
  const albumNames = albumsContainingSong
    .map(
      (album) =>
        `${album.name ?? ""}${album.year ?? ""}${album.coverImage ?? ""}`,
    )
    .sort()
    .join(",");

  const artistsOnSong = await db
    .select({ name: schema.artists.name })
    .from(schema.artistSongs)
    .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .where(eq(schema.artistSongs.songId, songId));
  const artistNames = artistsOnSong
    .map((artist) => artist.name ?? "")
    .sort()
    .join(",");

  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    [
      song.title,
      song.duration,
      song.fileType,
      song.coverImage,
      artistNames,
      albumNames,
    ].join("-"),
  );
};

export async function isLibrarySongSnapshotStale(songId: number) {
  const songRows = await db
    .select({ snapshotAtLastExport: schema.songs.snapshotAtLastExport })
    .from(schema.songs)
    .where(eq(schema.songs.id, songId))
    .limit(1);
  const snapshotAtLastExport = songRows[0]?.snapshotAtLastExport;

  if (songRows.length === 0) {
    return null;
  }

  if (!snapshotAtLastExport) {
    return true;
  }

  return (await getLibrarySongSnapshotHash(songId)) !== snapshotAtLastExport;
}

export async function markLibrarySongAsExported(songId: number) {
  const snapshotAtLastExport = await getLibrarySongSnapshotHash(songId);

  await db
    .update(schema.songs)
    .set({ snapshotAtLastExport })
    .where(eq(schema.songs.id, songId));
}

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import {
  isLibrarySongSnapshotStaleWithDependencies,
  markLibrarySongAsExportedWithDependencies,
} from "./library-song-export-snapshot-executor-repository";
import type { LibrarySongExportSnapshotDependencies } from "./library-song-export-snapshot-types-repository";

const librarySongExportSnapshotDependencies: LibrarySongExportSnapshotDependencies =
  {
    digestSnapshot: (input) =>
      Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input),
    loadAlbumRows: (songId) =>
      db
        .select({
          coverImage: schema.albums.coverImage,
          name: schema.albums.name,
          year: schema.albums.year,
        })
        .from(schema.albumSongs)
        .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
        .where(eq(schema.albumSongs.songId, songId)),
    loadArtistRows: (songId) =>
      db
        .select({ name: schema.artists.name })
        .from(schema.artistSongs)
        .innerJoin(
          schema.artists,
          eq(schema.artistSongs.artistId, schema.artists.id),
        )
        .where(eq(schema.artistSongs.songId, songId)),
    loadSnapshotAtLastExport: async (songId) => {
      const songRows = await db
        .select({ snapshotAtLastExport: schema.songs.snapshotAtLastExport })
        .from(schema.songs)
        .where(eq(schema.songs.id, songId))
        .limit(1);

      return songRows.length === 0
        ? undefined
        : songRows[0]?.snapshotAtLastExport;
    },
    loadSongRow: async (songId) => {
      const songRows = await db
        .select({
          coverImage: schema.songs.coverImage,
          duration: schema.songs.duration,
          fileType: schema.songs.fileType,
          snapshotAtLastExport: schema.songs.snapshotAtLastExport,
          title: schema.songs.title,
        })
        .from(schema.songs)
        .where(eq(schema.songs.id, songId))
        .limit(1);

      return songRows[0] ?? null;
    },
    updateSnapshotAtLastExport: async ({ snapshotAtLastExport, songId }) => {
      await db
        .update(schema.songs)
        .set({ snapshotAtLastExport })
        .where(eq(schema.songs.id, songId));
    },
  };

export async function isLibrarySongSnapshotStale(songId: number) {
  return isLibrarySongSnapshotStaleWithDependencies(
    songId,
    librarySongExportSnapshotDependencies,
  );
}

export async function markLibrarySongAsExported(songId: number) {
  await markLibrarySongAsExportedWithDependencies(
    songId,
    librarySongExportSnapshotDependencies,
  );
}

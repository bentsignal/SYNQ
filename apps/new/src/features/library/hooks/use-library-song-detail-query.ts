import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import {
  buildLibrarySongDetail,
  type LibrarySongDetailAlbumRow,
  type LibrarySongDetailArtistRow,
  type LibrarySongDetailLikedRow,
  type LibrarySongDetailPlaylistRow,
  type LibrarySongDetailSongRow,
} from "../services/library-song-detail-service";

export type { LibrarySongDetail } from "../services/library-song-detail-service";

export function useLibrarySongDetailQuery(songId: number) {
  const song = useLiveQuery(
    db
      .select({
        duration: schema.songs.duration,
        fileType: schema.songs.fileType,
        originalFileName: schema.songs.originalFileName,
        pathToFile: schema.songs.pathToFile,
        title: schema.songs.title,
      })
      .from(schema.songs)
      .where(eq(schema.songs.id, songId)),
  );
  const artists = useLiveQuery(
    db
      .select({
        id: schema.artists.id,
        name: schema.artists.name,
      })
      .from(schema.artistSongs)
      .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
      .where(eq(schema.artistSongs.songId, songId)),
  );
  const albums = useLiveQuery(
    db
      .select({
        id: schema.albums.id,
        name: schema.albums.name,
        track: schema.albumSongs.track,
        year: schema.albums.year,
      })
      .from(schema.albumSongs)
      .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
      .where(eq(schema.albumSongs.songId, songId)),
  );
  const playlists = useLiveQuery(
    db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
      })
      .from(schema.playlistSongs)
      .innerJoin(
        schema.playlists,
        eq(schema.playlistSongs.playlistId, schema.playlists.id),
      )
      .where(eq(schema.playlistSongs.songId, songId)),
  );
  const liked = useLiveQuery(
    db
      .select({ id: schema.playlistSongs.id })
      .from(schema.playlistSongs)
      .where(
        and(
          eq(schema.playlistSongs.playlistId, 2),
          eq(schema.playlistSongs.songId, songId),
        ),
      ),
  );

  const detail = useMemo(() => {
    return buildLibrarySongDetail({
      albumRows: (albums.data ?? []) as LibrarySongDetailAlbumRow[],
      artistRows: (artists.data ?? []) as LibrarySongDetailArtistRow[],
      likedRows: (liked.data ?? []) as LibrarySongDetailLikedRow[],
      playlistRows: (playlists.data ?? []) as LibrarySongDetailPlaylistRow[],
      songRow: (song.data?.[0] ?? null) as LibrarySongDetailSongRow | null,
      updatedAt: Math.max(
        song.updatedAt?.getTime() ?? 0,
        artists.updatedAt?.getTime() ?? 0,
        albums.updatedAt?.getTime() ?? 0,
        liked.updatedAt?.getTime() ?? 0,
        playlists.updatedAt?.getTime() ?? 0,
      ),
    });
  }, [
    albums.data,
    albums.updatedAt,
    artists.data,
    artists.updatedAt,
    liked.data,
    liked.updatedAt,
    playlists.data,
    playlists.updatedAt,
    song.data,
    song.updatedAt,
  ]);

  return {
    detail,
    errors: [song.error, artists.error, albums.error, liked.error, playlists.error].filter(Boolean),
  };
}

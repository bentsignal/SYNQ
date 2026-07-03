import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { likedSongsPlaylistId } from "../services/library-playlist-constants-service";

export const buildLibrarySongDetailRowsQuery = (songId: number) =>
  db
    .select({
      coverImage: schema.songs.coverImage,
      duration: schema.songs.duration,
      fileType: schema.songs.fileType,
      originalFileName: schema.songs.originalFileName,
      pathToFile: schema.songs.pathToFile,
      title: schema.songs.title,
    })
    .from(schema.songs)
    .where(eq(schema.songs.id, songId));

export const buildLibrarySongDetailArtistRowsQuery = (songId: number) =>
  db
    .select({
      id: schema.artists.id,
      name: schema.artists.name,
    })
    .from(schema.artistSongs)
    .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .where(eq(schema.artistSongs.songId, songId));

export const buildLibrarySongDetailAlbumRowsQuery = (songId: number) =>
  db
    .select({
      coverImage: schema.albums.coverImage,
      id: schema.albums.id,
      name: schema.albums.name,
      track: schema.albumSongs.track,
      year: schema.albums.year,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .where(eq(schema.albumSongs.songId, songId));

export const buildLibrarySongDetailPlaylistRowsQuery = (songId: number) =>
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
    .where(eq(schema.playlistSongs.songId, songId));

export const buildLibrarySongDetailLikedRowsQuery = (songId: number) =>
  db
    .select({
      id: schema.playlistSongs.id,
    })
    .from(schema.playlistSongs)
    .where(
      and(
        eq(schema.playlistSongs.playlistId, likedSongsPlaylistId),
        eq(schema.playlistSongs.songId, songId),
      ),
    );

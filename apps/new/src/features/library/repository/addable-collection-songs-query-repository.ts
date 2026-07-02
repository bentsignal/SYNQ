import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const buildAllAddableSongRowsQuery = () =>
  db
    .select({
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      duration: schema.songs.duration,
      songId: schema.songs.id,
      title: schema.songs.title,
    })
    .from(schema.songs)
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id));

export const buildPlaylistLinkedSongRowsQuery = (collectionId: number) =>
  db
    .select({ songId: schema.playlistSongs.songId })
    .from(schema.playlistSongs)
    .where(eq(schema.playlistSongs.playlistId, collectionId));

export const buildAlbumLinkedSongRowsQuery = (collectionId: number) =>
  db
    .select({ songId: schema.albumSongs.songId })
    .from(schema.albumSongs)
    .where(eq(schema.albumSongs.albumId, collectionId));

export const buildArtistLinkedSongRowsQuery = (collectionId: number) =>
  db
    .select({ songId: schema.artistSongs.songId })
    .from(schema.artistSongs)
    .where(eq(schema.artistSongs.artistId, collectionId));

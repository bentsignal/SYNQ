import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

export const buildAlbumRowsQuery = (id: number) =>
  db
    .select({
      artistName: schema.artists.name,
      coverImage: schema.albums.coverImage,
      name: schema.albums.name,
      year: schema.albums.year,
    })
    .from(schema.albums)
    .leftJoin(
      schema.artistsAlbums,
      eq(schema.albums.id, schema.artistsAlbums.albumId),
    )
    .leftJoin(schema.artists, eq(schema.artistsAlbums.artistId, schema.artists.id))
    .where(eq(schema.albums.id, id));

export const buildAlbumSongRowsQuery = (id: number) =>
  db
    .select({
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      duration: schema.songs.duration,
      pathToFile: schema.songs.pathToFile,
      songId: schema.songs.id,
      title: schema.songs.title,
      track: schema.albumSongs.track,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id))
    .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .where(eq(schema.albumSongs.albumId, id));

export const buildArtistRowsQuery = (id: number) =>
  db
    .select({
      albumId: schema.artistsAlbums.albumId,
      name: schema.artists.name,
      profileImage: schema.artists.profileImage,
    })
    .from(schema.artists)
    .leftJoin(
      schema.artistsAlbums,
      eq(schema.artists.id, schema.artistsAlbums.artistId),
    )
    .where(eq(schema.artists.id, id));

export const buildArtistSongRowsQuery = (id: number) =>
  db
    .select({
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      duration: schema.songs.duration,
      pathToFile: schema.songs.pathToFile,
      songId: schema.songs.id,
      title: schema.songs.title,
      track: schema.artistSongs.position,
    })
    .from(schema.artistSongs)
    .innerJoin(schema.songs, eq(schema.artistSongs.songId, schema.songs.id))
    .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(
      schema.albums,
      and(
        eq(schema.albumSongs.albumId, schema.albums.id),
        eq(schema.albumSongs.songId, schema.songs.id),
      ),
    )
    .where(eq(schema.artistSongs.artistId, id));

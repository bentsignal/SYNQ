import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

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

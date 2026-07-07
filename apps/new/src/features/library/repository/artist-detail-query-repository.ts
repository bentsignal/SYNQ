import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";

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
      albumCoverImage: schema.albums.coverImage,
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      duration: schema.songs.duration,
      pathToFile: schema.songs.pathToFile,
      songCoverImage: schema.songs.coverImage,
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

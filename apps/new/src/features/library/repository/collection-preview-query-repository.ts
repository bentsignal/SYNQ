import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const buildPlaylistPreviewRowsQuery = () =>
  db
    .select({
      coverImage: schema.playlists.coverImage,
      playlistId: schema.playlists.id,
      playlistName: schema.playlists.name,
      songId: schema.playlistSongs.songId,
    })
    .from(schema.playlists)
    .leftJoin(
      schema.playlistSongs,
      eq(schema.playlists.id, schema.playlistSongs.playlistId),
    );

export const buildAlbumPreviewRowsQuery = () =>
  db
    .select({
      albumCoverImage: schema.albums.coverImage,
      albumId: schema.albums.id,
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      songId: schema.albumSongs.songId,
      year: schema.albums.year,
    })
    .from(schema.albums)
    .leftJoin(schema.albumSongs, eq(schema.albums.id, schema.albumSongs.albumId))
    .leftJoin(
      schema.artistsAlbums,
      eq(schema.albums.id, schema.artistsAlbums.albumId),
    )
    .leftJoin(schema.artists, eq(schema.artistsAlbums.artistId, schema.artists.id));

export const buildArtistPreviewRowsQuery = () =>
  db
    .select({
      albumId: schema.artistsAlbums.albumId,
      artistId: schema.artists.id,
      artistName: schema.artists.name,
      profileImage: schema.artists.profileImage,
      songId: schema.artistSongs.songId,
    })
    .from(schema.artists)
    .leftJoin(
      schema.artistSongs,
      eq(schema.artists.id, schema.artistSongs.artistId),
    )
    .leftJoin(
      schema.artistsAlbums,
      eq(schema.artists.id, schema.artistsAlbums.artistId),
    );

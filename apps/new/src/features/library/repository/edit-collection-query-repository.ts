import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const buildEditAlbumRowQuery = (id: number) =>
  db
    .select({
      coverImage: schema.albums.coverImage,
      name: schema.albums.name,
      year: schema.albums.year,
    })
    .from(schema.albums)
    .where(eq(schema.albums.id, id));

export const buildEditAlbumArtistRowsQuery = (id: number) =>
  db
    .select({
      id: schema.artists.id,
      name: schema.artists.name,
    })
    .from(schema.artistsAlbums)
    .innerJoin(
      schema.artists,
      eq(schema.artistsAlbums.artistId, schema.artists.id),
    )
    .where(eq(schema.artistsAlbums.albumId, id));

export const buildEditArtistRowQuery = (id: number) =>
  db
    .select({
      name: schema.artists.name,
      profileImage: schema.artists.profileImage,
    })
    .from(schema.artists)
    .where(eq(schema.artists.id, id));

export const buildEditPlaylistRowQuery = (id: number) =>
  db
    .select({
      coverImage: schema.playlists.coverImage,
      name: schema.playlists.name,
    })
    .from(schema.playlists)
    .where(eq(schema.playlists.id, id));

import { db } from "@synq/db";
import * as schema from "@synq/db/schema";

export const buildSongSummaryRowsQuery = () =>
  db.select({ id: schema.songs.id }).from(schema.songs);

export const buildPlaylistSummaryRowsQuery = () =>
  db.select({ id: schema.playlists.id }).from(schema.playlists);

export const buildAlbumSummaryRowsQuery = () =>
  db.select({ id: schema.albums.id }).from(schema.albums);

export const buildArtistSummaryRowsQuery = () =>
  db.select({ id: schema.artists.id }).from(schema.artists);

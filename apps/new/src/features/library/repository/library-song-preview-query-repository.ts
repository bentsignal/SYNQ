import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const buildLibrarySongPreviewRowsQuery = () =>
  db
    .select({
      albumName: schema.albums.name,
      artistName: schema.artists.name,
      duration: schema.songs.duration,
      pathToFile: schema.songs.pathToFile,
      songId: schema.songs.id,
      title: schema.songs.title,
    })
    .from(schema.songs)
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id));

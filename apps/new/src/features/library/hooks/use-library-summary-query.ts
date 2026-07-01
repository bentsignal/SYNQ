import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const getCount = (rows: unknown[] | undefined) => rows?.length ?? 0;

export function useLibrarySummaryQuery() {
  const songs = useLiveQuery(
    db.select({ id: schema.songs.id }).from(schema.songs),
  );
  const playlists = useLiveQuery(
    db.select({ id: schema.playlists.id }).from(schema.playlists),
  );
  const albums = useLiveQuery(
    db.select({ id: schema.albums.id }).from(schema.albums),
  );
  const artists = useLiveQuery(
    db.select({ id: schema.artists.id }).from(schema.artists),
  );

  return {
    counts: {
      albums: getCount(albums.data),
      artists: getCount(artists.data),
      playlists: getCount(playlists.data),
      songs: getCount(songs.data),
    },
    errors: [
      songs.error,
      playlists.error,
      albums.error,
      artists.error,
    ].filter(Boolean),
    updatedAt: Math.max(
      songs.updatedAt?.getTime() ?? 0,
      playlists.updatedAt?.getTime() ?? 0,
      albums.updatedAt?.getTime() ?? 0,
      artists.updatedAt?.getTime() ?? 0,
    ),
  };
}

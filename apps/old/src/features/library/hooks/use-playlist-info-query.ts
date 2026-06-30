import { useMemo } from "react";
import { PlaylistType } from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/lib/image-utils";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { count, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type PlaylistInfoRow = {
  id: number;
  name: string | null;
  coverImage: string | null;
  songCount: number;
};

export const usePlaylistInfoQuery = (playlistId: number) => {
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
        coverImage: schema.playlists.coverImage,
        songCount: count(schema.playlistSongs.songId),
      })
      .from(schema.playlists)
      .leftJoin(
        schema.playlistSongs,
        eq(schema.playlists.id, schema.playlistSongs.playlistId),
      )
      .where(eq(schema.playlists.id, playlistId))
      .groupBy(schema.playlists.id),
  );

  const playlist = useMemo<PlaylistType | null>(() => {
    const row = (data?.[0] ?? null) as PlaylistInfoRow | null;

    if (!row) {
      return null;
    }

    const imagePaths = row.coverImage
      ? getImagePathFromHash(row.coverImage)
      : null;

    return {
      id: row.id,
      name: row.name ?? "",
      songCount: row.songCount,
      image: imagePaths?.pathToSmallImage,
      fullImage: imagePaths?.pathToFullImage,
    };
  }, [data]);

  return {
    playlist,
    error,
    updatedAt,
    isEmpty: !playlist,
  };
};

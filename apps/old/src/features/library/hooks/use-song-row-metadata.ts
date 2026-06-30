import { useMemo } from "react";
import { SongType } from "@/src/constants/Types";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type SongMetadataRow = {
  song: typeof schema.songs.$inferSelect;
  artistName: string | null;
  albumName: string | null;
};

type SongRowMetadata = {
  fileName: string;
  title: string;
  artist: string;
  album: string;
};

const toSongMetadata = (rows: SongMetadataRow[]): SongRowMetadata | null => {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const artists = new Set<string>();
  const albums = new Set<string>();

  rows.forEach(({ artistName, albumName }) => {
    if (artistName) {
      artists.add(artistName);
    }

    if (albumName) {
      albums.add(albumName);
    }
  });

  return {
    fileName: firstRow.song.originalFileName ?? "",
    title: firstRow.song.title ?? "",
    artist: Array.from(artists).join(", "),
    album: Array.from(albums).join(", "),
  };
};

export const useSongRowMetadata = (song: SongType): SongRowMetadata => {
  const { data } = useLiveQuery(
    db
      .select({
        song: schema.songs,
        artistName: schema.artists.name,
        albumName: schema.albums.name,
      })
      .from(schema.songs)
      .leftJoin(
        schema.artistSongs,
        eq(schema.songs.id, schema.artistSongs.songId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistSongs.artistId, schema.artists.id),
      )
      .leftJoin(
        schema.albumSongs,
        eq(schema.songs.id, schema.albumSongs.songId),
      )
      .leftJoin(
        schema.albums,
        and(
          eq(schema.albumSongs.albumId, schema.albums.id),
          eq(schema.albumSongs.songId, schema.songs.id),
        ),
      )
      .where(eq(schema.songs.id, song.id)),
  );

  return useMemo(() => {
    const liveMetadata = toSongMetadata((data ?? []) as SongMetadataRow[]);

    return {
      fileName: liveMetadata?.fileName ?? song.fileName ?? "",
      title: liveMetadata?.title ?? song.title ?? "",
      artist: liveMetadata?.artist ?? song.artist ?? "",
      album: liveMetadata?.album ?? song.album ?? "",
    };
  }, [data, song.album, song.artist, song.fileName, song.title]);
};

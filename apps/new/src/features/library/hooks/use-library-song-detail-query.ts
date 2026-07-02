import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type SongRow = {
  duration: number | null;
  fileType: string | null;
  originalFileName: string | null;
  pathToFile: string | null;
  title: string | null;
};

type AlbumRow = {
  id: number;
  name: string | null;
  track: number | null;
  year: number | null;
};

type ArtistRow = {
  id: number;
  name: string | null;
};

type PlaylistRow = {
  id: number;
  name: string | null;
};

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatDuration = (duration: number | null) => {
  if (!duration) {
    return "--:--";
  }

  const totalSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatNames = (names: string[]) =>
  names.length === 0
    ? "Unknown"
    : [...names].sort((first, second) => first.localeCompare(second)).join(", ");

const uniqueById = <T extends { id: number }>(rows: T[]) => {
  const map = new Map<number, T>();
  rows.forEach((row) => {
    map.set(row.id, row);
  });

  return Array.from(map.values());
};

export function useLibrarySongDetailQuery(songId: number) {
  const song = useLiveQuery(
    db
      .select({
        duration: schema.songs.duration,
        fileType: schema.songs.fileType,
        originalFileName: schema.songs.originalFileName,
        pathToFile: schema.songs.pathToFile,
        title: schema.songs.title,
      })
      .from(schema.songs)
      .where(eq(schema.songs.id, songId)),
  );
  const artists = useLiveQuery(
    db
      .select({
        id: schema.artists.id,
        name: schema.artists.name,
      })
      .from(schema.artistSongs)
      .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
      .where(eq(schema.artistSongs.songId, songId)),
  );
  const albums = useLiveQuery(
    db
      .select({
        id: schema.albums.id,
        name: schema.albums.name,
        track: schema.albumSongs.track,
        year: schema.albums.year,
      })
      .from(schema.albumSongs)
      .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
      .where(eq(schema.albumSongs.songId, songId)),
  );
  const playlists = useLiveQuery(
    db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
      })
      .from(schema.playlistSongs)
      .innerJoin(
        schema.playlists,
        eq(schema.playlistSongs.playlistId, schema.playlists.id),
      )
      .where(eq(schema.playlistSongs.songId, songId)),
  );

  const detail = useMemo(() => {
    const songRow = (song.data?.[0] ?? null) as SongRow | null;
    const artistRows = uniqueById((artists.data ?? []) as ArtistRow[]);
    const albumRows = uniqueById((albums.data ?? []) as AlbumRow[]);
    const playlistRows = uniqueById((playlists.data ?? []) as PlaylistRow[]);
    const artistLabel = formatNames(
      artistRows.flatMap((artist) => (artist.name ? [artist.name] : [])),
    );
    const albumLabel = formatNames(
      albumRows.flatMap((album) => (album.name ? [album.name] : [])),
    );

    return {
      albumLabel,
      albums: albumRows.map((album) => ({
        detail: album.year ? album.year.toString() : "Album",
        id: album.id,
        title: album.name ?? "Untitled album",
        track: album.track,
      })),
      artistLabel,
      artists: artistRows.map((artist) => ({
        id: artist.id,
        title: artist.name ?? "Untitled artist",
      })),
      duration: songRow?.duration ?? null,
      durationLabel: formatDuration(songRow?.duration ?? null),
      fileType: songRow?.fileType ?? "Unknown file type",
      isMissing: !songRow,
      originalFileName: songRow?.originalFileName ?? "Unknown source file",
      pathToFile: songRow?.pathToFile ?? null,
      playlists: playlistRows.map((playlist) => ({
        id: playlist.id,
        title: playlist.name ?? "Untitled playlist",
      })),
      relationshipSummary: [
        formatCount(artistRows.length, "artist"),
        formatCount(albumRows.length, "album"),
        formatCount(playlistRows.length, "playlist"),
      ].join(" / "),
      title: songRow?.title ?? "Song not found",
      updatedAt: Math.max(
        song.updatedAt?.getTime() ?? 0,
        artists.updatedAt?.getTime() ?? 0,
        albums.updatedAt?.getTime() ?? 0,
        playlists.updatedAt?.getTime() ?? 0,
      ),
    };
  }, [
    albums.data,
    albums.updatedAt,
    artists.data,
    artists.updatedAt,
    playlists.data,
    playlists.updatedAt,
    song.data,
    song.updatedAt,
  ]);

  return {
    detail,
    errors: [song.error, artists.error, albums.error, playlists.error].filter(Boolean),
  };
}

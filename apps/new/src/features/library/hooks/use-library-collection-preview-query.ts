import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

type CollectionKind = "albums" | "artists" | "playlists";

export type LibraryCollectionPreview = {
  detail: string;
  id: number;
  kind: CollectionKind;
  meta: string;
  title: string;
};

type PlaylistRow = {
  playlistId: number;
  playlistName: string | null;
  songId: number | null;
};

type AlbumRow = {
  albumId: number;
  albumName: string | null;
  artistName: string | null;
  songId: number | null;
  year: number | null;
};

type ArtistRow = {
  albumId: number | null;
  artistId: number;
  artistName: string | null;
  songId: number | null;
};

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatArtists = (artists: Set<string>) => {
  if (artists.size === 0) {
    return "Unknown artist";
  }

  return Array.from(artists).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const playlistRowsToPreview = (rows: PlaylistRow[]) => {
  const playlistMap = new Map<
    number,
    {
      name: string;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const playlist =
      playlistMap.get(row.playlistId) ??
      {
        name: row.playlistName ?? "Untitled playlist",
        songIds: new Set<number>(),
      };

    if (row.songId) {
      playlist.songIds.add(row.songId);
    }

    playlistMap.set(row.playlistId, playlist);
  });

  return Array.from(playlistMap.entries())
    .map<LibraryCollectionPreview>(([id, playlist]) => ({
      detail: formatCount(playlist.songIds.size, "song"),
      id,
      kind: "playlists",
      meta: "Playlist",
      title: playlist.name,
    }))
    .sort((first, second) => second.id - first.id)
    .slice(0, 6);
};

const albumRowsToPreview = (rows: AlbumRow[]) => {
  const albumMap = new Map<
    number,
    {
      artistNames: Set<string>;
      name: string;
      songIds: Set<number>;
      year: number | null;
    }
  >();

  rows.forEach((row) => {
    const album =
      albumMap.get(row.albumId) ??
      {
        artistNames: new Set<string>(),
        name: row.albumName ?? "Untitled album",
        songIds: new Set<number>(),
        year: row.year,
      };

    if (row.artistName) {
      album.artistNames.add(row.artistName);
    }

    if (row.songId) {
      album.songIds.add(row.songId);
    }

    albumMap.set(row.albumId, album);
  });

  return Array.from(albumMap.entries())
    .map<LibraryCollectionPreview>(([id, album]) => ({
      detail: formatCount(album.songIds.size, "song"),
      id,
      kind: "albums",
      meta: album.year ? `${formatArtists(album.artistNames)} / ${album.year}` : formatArtists(album.artistNames),
      title: album.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title))
    .slice(0, 6);
};

const artistRowsToPreview = (rows: ArtistRow[]) => {
  const artistMap = new Map<
    number,
    {
      albumIds: Set<number>;
      name: string;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const artist =
      artistMap.get(row.artistId) ??
      {
        albumIds: new Set<number>(),
        name: row.artistName ?? "Untitled artist",
        songIds: new Set<number>(),
      };

    if (row.albumId) {
      artist.albumIds.add(row.albumId);
    }

    if (row.songId) {
      artist.songIds.add(row.songId);
    }

    artistMap.set(row.artistId, artist);
  });

  return Array.from(artistMap.entries())
    .map<LibraryCollectionPreview>(([id, artist]) => ({
      detail: `${formatCount(artist.songIds.size, "song")} / ${formatCount(
        artist.albumIds.size,
        "album",
      )}`,
      id,
      kind: "artists",
      meta: "Artist",
      title: artist.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title))
    .slice(0, 6);
};

export function useLibraryCollectionPreviewQuery() {
  const playlists = useLiveQuery(
    db
      .select({
        playlistId: schema.playlists.id,
        playlistName: schema.playlists.name,
        songId: schema.playlistSongs.songId,
      })
      .from(schema.playlists)
      .leftJoin(
        schema.playlistSongs,
        eq(schema.playlists.id, schema.playlistSongs.playlistId),
      ),
  );
  const albums = useLiveQuery(
    db
      .select({
        albumId: schema.albums.id,
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        songId: schema.albumSongs.songId,
        year: schema.albums.year,
      })
      .from(schema.albums)
      .leftJoin(
        schema.albumSongs,
        eq(schema.albums.id, schema.albumSongs.albumId),
      )
      .leftJoin(
        schema.artistsAlbums,
        eq(schema.albums.id, schema.artistsAlbums.albumId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistsAlbums.artistId, schema.artists.id),
      ),
  );
  const artists = useLiveQuery(
    db
      .select({
        albumId: schema.artistsAlbums.albumId,
        artistId: schema.artists.id,
        artistName: schema.artists.name,
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
      ),
  );

  const collections = useMemo(
    () => ({
      albums: albumRowsToPreview((albums.data ?? []) as AlbumRow[]),
      artists: artistRowsToPreview((artists.data ?? []) as ArtistRow[]),
      playlists: playlistRowsToPreview((playlists.data ?? []) as PlaylistRow[]),
    }),
    [albums.data, artists.data, playlists.data],
  );

  return {
    collections,
    errors: [playlists.error, albums.error, artists.error].filter(Boolean),
    isEmpty:
      collections.albums.length === 0 &&
      collections.artists.length === 0 &&
      collections.playlists.length === 0,
    updatedAt: Math.max(
      playlists.updatedAt?.getTime() ?? 0,
      albums.updatedAt?.getTime() ?? 0,
      artists.updatedAt?.getTime() ?? 0,
    ),
  };
}

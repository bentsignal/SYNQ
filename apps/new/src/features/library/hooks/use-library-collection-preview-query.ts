import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";

export type CollectionKind = "albums" | "artists" | "playlists";

export type LibraryCollectionPreview = {
  detail: string;
  id: number;
  imagePath: string | null;
  kind: CollectionKind;
  meta: string;
  title: string;
};

type PlaylistRow = {
  coverImage: string | null;
  playlistId: number;
  playlistName: string | null;
  songId: number | null;
};

type AlbumRow = {
  albumId: number;
  albumCoverImage: string | null;
  albumName: string | null;
  artistName: string | null;
  songId: number | null;
  year: number | null;
};

type ArtistRow = {
  albumId: number | null;
  artistId: number;
  artistName: string | null;
  profileImage: string | null;
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

const limitCollectionPreviews = (
  previews: LibraryCollectionPreview[],
  limit: number | null,
) => (limit === null ? previews : previews.slice(0, limit));

const playlistRowsToPreview = (rows: PlaylistRow[], limit: number | null) => {
  const playlistMap = new Map<
    number,
    {
      name: string;
      coverImage: string | null;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const playlist =
      playlistMap.get(row.playlistId) ??
      {
        name: row.playlistName ?? "Untitled playlist",
        coverImage: row.coverImage,
        songIds: new Set<number>(),
      };

    if (row.songId) {
      playlist.songIds.add(row.songId);
    }

    playlistMap.set(row.playlistId, playlist);
  });

  const previews = Array.from(playlistMap.entries())
    .map<LibraryCollectionPreview>(([id, playlist]) => ({
      detail: formatCount(playlist.songIds.size, "song"),
      id,
      imagePath: playlist.coverImage
        ? getImagePathFromHash(playlist.coverImage).pathToSmallImage
        : null,
      kind: "playlists",
      meta: "Playlist",
      title: playlist.name,
    }))
    .sort((first, second) => second.id - first.id);

  return limitCollectionPreviews(previews, limit);
};

const albumRowsToPreview = (rows: AlbumRow[], limit: number | null) => {
  const albumMap = new Map<
    number,
    {
      artistNames: Set<string>;
      coverImage: string | null;
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
        coverImage: row.albumCoverImage,
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

  const previews = Array.from(albumMap.entries())
    .map<LibraryCollectionPreview>(([id, album]) => ({
      detail: formatCount(album.songIds.size, "song"),
      id,
      imagePath: album.coverImage
        ? getImagePathFromHash(album.coverImage).pathToSmallImage
        : null,
      kind: "albums",
      meta: album.year
        ? `${formatArtists(album.artistNames)} / ${album.year}`
        : formatArtists(album.artistNames),
      title: album.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};

const artistRowsToPreview = (rows: ArtistRow[], limit: number | null) => {
  const artistMap = new Map<
    number,
    {
      albumIds: Set<number>;
      name: string;
      profileImage: string | null;
      songIds: Set<number>;
    }
  >();

  rows.forEach((row) => {
    const artist =
      artistMap.get(row.artistId) ??
      {
        albumIds: new Set<number>(),
        name: row.artistName ?? "Untitled artist",
        profileImage: row.profileImage,
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

  const previews = Array.from(artistMap.entries())
    .map<LibraryCollectionPreview>(([id, artist]) => ({
      detail: `${formatCount(artist.songIds.size, "song")} / ${formatCount(
        artist.albumIds.size,
        "album",
      )}`,
      id,
      imagePath: artist.profileImage
        ? getImagePathFromHash(artist.profileImage).pathToSmallImage
        : null,
      kind: "artists",
      meta: "Artist",
      title: artist.name,
    }))
    .sort((first, second) => first.title.localeCompare(second.title));

  return limitCollectionPreviews(previews, limit);
};

type LibraryCollectionPreviewQueryOptions = {
  limit?: number | null;
};

export function useLibraryCollectionPreviewQuery({
  limit = 6,
}: LibraryCollectionPreviewQueryOptions = {}) {
  const playlists = useLiveQuery(
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
      ),
  );
  const albums = useLiveQuery(
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
      ),
  );

  const collections = useMemo(
    () => ({
      albums: albumRowsToPreview((albums.data ?? []) as AlbumRow[], limit),
      artists: artistRowsToPreview((artists.data ?? []) as ArtistRow[], limit),
      playlists: playlistRowsToPreview(
        (playlists.data ?? []) as PlaylistRow[],
        limit,
      ),
    }),
    [albums.data, artists.data, limit, playlists.data],
  );
  const totals = {
    albums: albumRowsToPreview((albums.data ?? []) as AlbumRow[], null).length,
    artists: artistRowsToPreview((artists.data ?? []) as ArtistRow[], null)
      .length,
    playlists: playlistRowsToPreview(
      (playlists.data ?? []) as PlaylistRow[],
      null,
    ).length,
  };

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
    totals,
  };
}

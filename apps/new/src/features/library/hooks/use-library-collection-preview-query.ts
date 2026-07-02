import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  albumRowsToPreview,
  artistRowsToPreview,
  playlistRowsToPreview,
  type AlbumPreviewRow,
  type ArtistPreviewRow,
  type PlaylistPreviewRow,
} from "../services/library-collection-preview-service";

export type {
  CollectionKind,
  LibraryCollectionPreview,
} from "../services/library-collection-preview-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

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
      albums: albumRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (albums.data ?? []) as AlbumPreviewRow[],
      }),
      artists: artistRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (artists.data ?? []) as ArtistPreviewRow[],
      }),
      playlists: playlistRowsToPreview({
        getImagePath: getSmallImagePath,
        limit,
        rows: (playlists.data ?? []) as PlaylistPreviewRow[],
      }),
    }),
    [albums.data, artists.data, limit, playlists.data],
  );
  const totals = {
    albums: albumRowsToPreview({
      rows: (albums.data ?? []) as AlbumPreviewRow[],
      limit: null,
    }).length,
    artists: artistRowsToPreview({
      rows: (artists.data ?? []) as ArtistPreviewRow[],
      limit: null,
    }).length,
    playlists: playlistRowsToPreview({
      rows: (playlists.data ?? []) as PlaylistPreviewRow[],
      limit: null,
    }).length,
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

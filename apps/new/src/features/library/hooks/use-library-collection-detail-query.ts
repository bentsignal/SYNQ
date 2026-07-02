import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";
import {
  buildAlbumDetail,
  buildArtistDetail,
  buildPlaylistDetail,
  type AlbumDetailRow,
  type ArtistDetailRow,
  type LibraryCollectionDetailSongRow,
  type PlaylistDetailRow,
} from "../services/library-collection-detail-service";

export type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "../services/library-collection-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

function usePlaylistRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        coverImage: schema.playlists.coverImage,
        name: schema.playlists.name,
      })
      .from(schema.playlists)
      .where(eq(schema.playlists.id, id)),
  );
}

function usePlaylistSongRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        pathToFile: schema.songs.pathToFile,
        songId: schema.songs.id,
        title: schema.songs.title,
        track: schema.playlistSongs.position,
      })
      .from(schema.playlistSongs)
      .innerJoin(schema.songs, eq(schema.playlistSongs.songId, schema.songs.id))
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
      .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
      .where(eq(schema.playlistSongs.playlistId, id)),
  );
}

function useAlbumRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        artistName: schema.artists.name,
        coverImage: schema.albums.coverImage,
        name: schema.albums.name,
        year: schema.albums.year,
      })
      .from(schema.albums)
      .leftJoin(
        schema.artistsAlbums,
        eq(schema.albums.id, schema.artistsAlbums.albumId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistsAlbums.artistId, schema.artists.id),
      )
      .where(eq(schema.albums.id, id)),
  );
}

function useAlbumSongRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        pathToFile: schema.songs.pathToFile,
        songId: schema.songs.id,
        title: schema.songs.title,
        track: schema.albumSongs.track,
      })
      .from(schema.albumSongs)
      .innerJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id))
      .leftJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
      .leftJoin(
        schema.artistSongs,
        eq(schema.songs.id, schema.artistSongs.songId),
      )
      .leftJoin(
        schema.artists,
        eq(schema.artistSongs.artistId, schema.artists.id),
      )
      .where(eq(schema.albumSongs.albumId, id)),
  );
}

function useArtistRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        albumId: schema.artistsAlbums.albumId,
        name: schema.artists.name,
        profileImage: schema.artists.profileImage,
      })
      .from(schema.artists)
      .leftJoin(
        schema.artistsAlbums,
        eq(schema.artists.id, schema.artistsAlbums.artistId),
      )
      .where(eq(schema.artists.id, id)),
  );
}

function useArtistSongRowsQuery(id: number) {
  return useLiveQuery(
    db
      .select({
        albumName: schema.albums.name,
        artistName: schema.artists.name,
        duration: schema.songs.duration,
        pathToFile: schema.songs.pathToFile,
        songId: schema.songs.id,
        title: schema.songs.title,
        track: schema.artistSongs.position,
      })
      .from(schema.artistSongs)
      .innerJoin(schema.songs, eq(schema.artistSongs.songId, schema.songs.id))
      .innerJoin(
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
      .where(eq(schema.artistSongs.artistId, id)),
  );
}

export function usePlaylistCollectionDetailQuery({ id }: { id: number }) {
  const playlist = usePlaylistRowsQuery(id);
  const playlistSongs = usePlaylistSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildPlaylistDetail({
        getImagePath: getSmallImagePath,
        playlistRows: (playlist.data ?? []) as PlaylistDetailRow[],
        songRows: (playlistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          playlist.updatedAt?.getTime() ?? 0,
          playlistSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [
      playlist.data,
      playlist.updatedAt,
      playlistSongs.data,
      playlistSongs.updatedAt,
    ],
  );

  return {
    detail,
    errors: [playlist.error, playlistSongs.error].filter(Boolean),
  };
}

export function useAlbumCollectionDetailQuery({ id }: { id: number }) {
  const album = useAlbumRowsQuery(id);
  const albumSongs = useAlbumSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildAlbumDetail({
        albumRows: (album.data ?? []) as AlbumDetailRow[],
        getImagePath: getSmallImagePath,
        songRows: (albumSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          album.updatedAt?.getTime() ?? 0,
          albumSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [album.data, album.updatedAt, albumSongs.data, albumSongs.updatedAt],
  );

  return {
    detail,
    errors: [album.error, albumSongs.error].filter(Boolean),
  };
}

export function useArtistCollectionDetailQuery({ id }: { id: number }) {
  const artist = useArtistRowsQuery(id);
  const artistSongs = useArtistSongRowsQuery(id);
  const detail = useMemo(
    () =>
      buildArtistDetail({
        artistRows: (artist.data ?? []) as ArtistDetailRow[],
        getImagePath: getSmallImagePath,
        songRows: (artistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          artist.updatedAt?.getTime() ?? 0,
          artistSongs.updatedAt?.getTime() ?? 0,
        ),
      }),
    [artist.data, artist.updatedAt, artistSongs.data, artistSongs.updatedAt],
  );

  return {
    detail,
    errors: [artist.error, artistSongs.error].filter(Boolean),
  };
}

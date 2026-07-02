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
  type LibraryCollectionDetailKind,
  type LibraryCollectionDetailSongRow,
  type PlaylistDetailRow,
} from "../services/library-collection-detail-service";

export type {
  LibraryCollectionDetailKind,
  LibraryCollectionDetailSong,
} from "../services/library-collection-detail-service";

const getSmallImagePath = (imageHash: string) =>
  getImagePathFromHash(imageHash).pathToSmallImage;

export function useLibraryCollectionDetailQuery({
  id,
  kind,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
}) {
  const playlist = useLiveQuery(
    db
      .select({
        coverImage: schema.playlists.coverImage,
        name: schema.playlists.name,
      })
      .from(schema.playlists)
      .where(eq(schema.playlists.id, id)),
  );
  const playlistSongs = useLiveQuery(
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
  const album = useLiveQuery(
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
  const albumSongs = useLiveQuery(
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
  const artist = useLiveQuery(
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
  const artistSongs = useLiveQuery(
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

  const detail = useMemo(() => {
    if (kind === "album") {
      return buildAlbumDetail({
        albumRows: album.data ?? [],
        getImagePath: getSmallImagePath,
        songRows: (albumSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          album.updatedAt?.getTime() ?? 0,
          albumSongs.updatedAt?.getTime() ?? 0,
        ),
      });
    }

    if (kind === "artist") {
      return buildArtistDetail({
        artistRows: artist.data ?? [],
        getImagePath: getSmallImagePath,
        songRows: (artistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
        updatedAt: Math.max(
          artist.updatedAt?.getTime() ?? 0,
          artistSongs.updatedAt?.getTime() ?? 0,
        ),
      });
    }

    return buildPlaylistDetail({
      getImagePath: getSmallImagePath,
      playlistRows: (playlist.data ?? []) as PlaylistDetailRow[],
      songRows: (playlistSongs.data ?? []) as LibraryCollectionDetailSongRow[],
      updatedAt: Math.max(
        playlist.updatedAt?.getTime() ?? 0,
        playlistSongs.updatedAt?.getTime() ?? 0,
      ),
    });
  }, [
    album.data,
    album.updatedAt,
    albumSongs.data,
    albumSongs.updatedAt,
    artist.data,
    artist.updatedAt,
    artistSongs.data,
    artistSongs.updatedAt,
    kind,
    playlist.data,
    playlist.updatedAt,
    playlistSongs.data,
    playlistSongs.updatedAt,
  ]);

  return {
    detail,
    errors: [
      playlist.error,
      playlistSongs.error,
      album.error,
      albumSongs.error,
      artist.error,
      artistSongs.error,
    ].filter(Boolean),
  };
}

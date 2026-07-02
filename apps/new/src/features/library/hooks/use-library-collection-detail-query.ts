import { useMemo } from "react";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getImagePathFromHash } from "@/src/features/images/services/image-storage-service";

export type LibraryCollectionDetailKind = "album" | "artist" | "playlist";

export type LibraryCollectionDetailSong = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  title: string;
  track: number | null;
};

type DetailSongRow = {
  albumName: string | null;
  artistName: string | null;
  duration: number | null;
  songId: number;
  title: string | null;
  track: number | null;
};

const unknownLabel = "Unknown";

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const formatNames = (names: Set<string>) => {
  if (names.size === 0) {
    return unknownLabel;
  }

  return Array.from(names).sort((first, second) =>
    first.localeCompare(second),
  ).join(", ");
};

const rowsToSongs = (rows: DetailSongRow[]) => {
  const songMap = new Map<
    number,
    {
      albumNames: Set<string>;
      artistNames: Set<string>;
      duration: number | null;
      id: number;
      title: string;
      track: number | null;
    }
  >();

  rows.forEach((row) => {
    const song =
      songMap.get(row.songId) ??
      {
        albumNames: new Set<string>(),
        artistNames: new Set<string>(),
        duration: row.duration,
        id: row.songId,
        title: row.title ?? "Untitled song",
        track: row.track,
      };

    if (row.albumName) {
      song.albumNames.add(row.albumName);
    }

    if (row.artistName) {
      song.artistNames.add(row.artistName);
    }

    songMap.set(row.songId, song);
  });

  return Array.from(songMap.values())
    .map<LibraryCollectionDetailSong>((song) => ({
      album: formatNames(song.albumNames),
      artist: formatNames(song.artistNames),
      duration: song.duration,
      id: song.id,
      title: song.title,
      track: song.track,
    }))
    .sort((first, second) => {
      if (first.track !== null || second.track !== null) {
        return (
          (first.track ?? Number.MAX_SAFE_INTEGER) -
          (second.track ?? Number.MAX_SAFE_INTEGER)
        );
      }

      return first.id - second.id;
    });
};

type CollectionDetail = {
  detail: string;
  eyebrow: string;
  imagePath: string | null;
  isMissing: boolean;
  kind: LibraryCollectionDetailKind;
  meta: string;
  songs: LibraryCollectionDetailSong[];
  title: string;
  updatedAt: number;
};

const buildPlaylistDetail = ({
  playlistRows,
  songRows,
  updatedAt,
}: {
  playlistRows: { coverImage: string | null; name: string | null }[];
  songRows: DetailSongRow[];
  updatedAt: number;
}): CollectionDetail => {
  const songs = rowsToSongs(songRows);
  const playlist = playlistRows[0];

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Playlist",
    imagePath: playlist?.coverImage
      ? getImagePathFromHash(playlist.coverImage).pathToSmallImage
      : null,
    isMissing: !playlist,
    kind: "playlist",
    meta: "Manual collection",
    songs,
    title: playlist?.name ?? "Playlist not found",
    updatedAt,
  };
};

const buildAlbumDetail = ({
  albumRows,
  songRows,
  updatedAt,
}: {
  albumRows: {
    artistName: string | null;
    coverImage: string | null;
    name: string | null;
    year: number | null;
  }[];
  songRows: DetailSongRow[];
  updatedAt: number;
}): CollectionDetail => {
  const artists = new Set<string>();
  albumRows.forEach((row) => {
    if (row.artistName) {
      artists.add(row.artistName);
    }
  });

  const album = albumRows[0];
  const songs = rowsToSongs(songRows);
  const artistLabel = formatNames(artists);

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Album",
    imagePath: album?.coverImage
      ? getImagePathFromHash(album.coverImage).pathToSmallImage
      : null,
    isMissing: !album,
    kind: "album",
    meta: album?.year ? `${artistLabel} / ${album.year}` : artistLabel,
    songs,
    title: album?.name ?? "Album not found",
    updatedAt,
  };
};

const buildArtistDetail = ({
  artistRows,
  songRows,
  updatedAt,
}: {
  artistRows: {
    albumId: number | null;
    name: string | null;
    profileImage: string | null;
  }[];
  songRows: DetailSongRow[];
  updatedAt: number;
}): CollectionDetail => {
  const albumIds = new Set<number>();
  artistRows.forEach((row) => {
    if (row.albumId) {
      albumIds.add(row.albumId);
    }
  });

  const artist = artistRows[0];
  const songs = rowsToSongs(songRows);

  return {
    detail: `${formatCount(songs.length, "song")} / ${formatCount(
      albumIds.size,
      "album",
    )}`,
    eyebrow: "Artist",
    imagePath: artist?.profileImage
      ? getImagePathFromHash(artist.profileImage).pathToSmallImage
      : null,
    isMissing: !artist,
    kind: "artist",
    meta: "Library artist",
    songs,
    title: artist?.name ?? "Artist not found",
    updatedAt,
  };
};

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
        songRows: (albumSongs.data ?? []) as DetailSongRow[],
        updatedAt: Math.max(
          album.updatedAt?.getTime() ?? 0,
          albumSongs.updatedAt?.getTime() ?? 0,
        ),
      });
    }

    if (kind === "artist") {
      return buildArtistDetail({
        artistRows: artist.data ?? [],
        songRows: (artistSongs.data ?? []) as DetailSongRow[],
        updatedAt: Math.max(
          artist.updatedAt?.getTime() ?? 0,
          artistSongs.updatedAt?.getTime() ?? 0,
        ),
      });
    }

    return buildPlaylistDetail({
      playlistRows: playlist.data ?? [],
      songRows: (playlistSongs.data ?? []) as DetailSongRow[],
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

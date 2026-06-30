import {
  AlbumType,
  ArtistType,
  PageType,
  SongType,
  SortOrder,
  SortType,
} from "@/src/constants/Types";
import { getImagePathFromHash } from "@/src/features/images/repository/image-repository";
import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { and, eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system";

type SongRelationRow = {
  song: typeof schema.songs.$inferSelect;
  artistName: string | null;
  albumName: string | null;
  albumCoverImage: string | null;
  track?: number | null;
};

type MappedSong = SongType & {
  artistNames: Set<string>;
  albumNames: Set<string>;
  albumCoverImage?: string | null;
};

const normalizeQuery = (query?: string) => query?.trim().toLowerCase() ?? "";

const compareText = (first?: string, second?: string) =>
  (first ?? "").localeCompare(second ?? "");

const compareTrack = (first?: number, second?: number) => {
  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return first - second;
};

const matchesQuery = (song: SongType, query: string) => {
  if (!query) {
    return true;
  }

  return [song.title, song.artist, song.album].some((value) =>
    value?.toLowerCase().includes(query),
  );
};

const sortSongs = (
  songs: SongType[],
  sort: SortType,
  order: SortOrder,
) => {
  const sorted = [...songs].sort((first, second) => {
    if (sort === SortType.TITLE) {
      return compareText(first.title, second.title);
    }

    if (sort === SortType.ARTIST) {
      return compareText(first.artist, second.artist);
    }

    if (sort === SortType.ALBUM) {
      return compareText(first.album, second.album);
    }

    if (sort === SortType.TRACK) {
      return compareTrack(first.track, second.track);
    }

    return first.id - second.id;
  });

  return order === SortOrder.DESC ? sorted.reverse() : sorted;
};

const rowsToSongs = (rows: SongRelationRow[], pageType: PageType) => {
  const songMap = new Map<number, MappedSong>();

  rows.forEach(({ song, artistName, albumName, albumCoverImage, track }) => {
    const current =
      songMap.get(song.id) ??
      ({
        id: song.id,
        edited: false,
        fileName: song.originalFileName ?? undefined,
        fileType: song.fileType ?? undefined,
        format: "id3v2.4",
        title: song.title ?? undefined,
        duration: song.duration ?? undefined,
        track: track ?? undefined,
        artwork: song.coverImage
          ? getImagePathFromHash(song.coverImage).pathToFullImage
          : undefined,
        pageType,
        artistNames: new Set<string>(),
        albumNames: new Set<string>(),
        albumCoverImage: undefined,
      } satisfies MappedSong);

    if (artistName) {
      current.artistNames.add(artistName);
    }

    if (albumName) {
      current.albumNames.add(albumName);
    }

    current.albumCoverImage = current.albumCoverImage ?? albumCoverImage;

    songMap.set(song.id, current);
  });

  return Array.from(songMap.values()).map((song) => {
    const { artistNames, albumNames, albumCoverImage, ...result } = song;
    return {
      ...result,
      artist: Array.from(artistNames).join(", "),
      album: Array.from(albumNames).join(", "),
      artwork: albumCoverImage
        ? getImagePathFromHash(albumCoverImage).pathToFullImage
        : result.artwork,
    };
  });
};

const filterAndSortSongs = ({
  rows,
  pageType,
  query,
  sort,
  order,
}: {
  rows: SongRelationRow[];
  pageType: PageType;
  query?: string;
  sort: SortType;
  order: SortOrder;
}) => {
  const normalizedQuery = normalizeQuery(query);
  return sortSongs(
    rowsToSongs(rows, pageType).filter((song) =>
      matchesQuery(song, normalizedQuery),
    ),
    sort,
    order,
  );
};

export const getLibraryPlaylistSongs = async ({
  playlistId,
  pageType = PageType.LIBRARY,
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: {
  playlistId: number;
  pageType?: PageType;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
}) => {
  const rows = await db
    .select({
      song: schema.songs,
      artistName: schema.artists.name,
      albumName: schema.albums.name,
      albumCoverImage: schema.albums.coverImage,
    })
    .from(schema.playlistSongs)
    .innerJoin(schema.songs, eq(schema.playlistSongs.songId, schema.songs.id))
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(
      schema.albums,
      and(
        eq(schema.albumSongs.albumId, schema.albums.id),
        eq(schema.albumSongs.songId, schema.songs.id),
      ),
    )
    .where(eq(schema.playlistSongs.playlistId, playlistId));

  return filterAndSortSongs({ rows, pageType, query, sort, order });
};

export const getLibraryAlbumSongs = async ({
  albumId,
  query,
  sort = SortType.TRACK,
  order = SortOrder.ASC,
}: {
  albumId: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
}) => {
  const rows = await db
    .select({
      song: schema.songs,
      track: schema.albumSongs.track,
      artistName: schema.artists.name,
      albumName: schema.albums.name,
      albumCoverImage: schema.albums.coverImage,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.songs, eq(schema.albumSongs.songId, schema.songs.id))
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(
      schema.albums,
      and(
        eq(schema.albumSongs.albumId, schema.albums.id),
        eq(schema.albumSongs.songId, schema.songs.id),
      ),
    )
    .where(eq(schema.albumSongs.albumId, albumId));

  return filterAndSortSongs({
    rows,
    pageType: PageType.ALBUM,
    query,
    sort,
    order,
  });
};

export const getLibraryArtistSongs = async ({
  artistId,
  query,
  sort = SortType.DATE,
  order = SortOrder.DESC,
}: {
  artistId: number;
  query?: string;
  sort?: SortType;
  order?: SortOrder;
}) => {
  const rows = await db
    .select({
      song: schema.songs,
      artistName: schema.artists.name,
      albumName: schema.albums.name,
      albumCoverImage: schema.albums.coverImage,
    })
    .from(schema.artistSongs)
    .innerJoin(schema.songs, eq(schema.artistSongs.songId, schema.songs.id))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(
      schema.albums,
      and(
        eq(schema.albumSongs.albumId, schema.albums.id),
        eq(schema.albumSongs.songId, schema.songs.id),
      ),
    )
    .where(eq(schema.artistSongs.artistId, artistId));

  return filterAndSortSongs({
    rows,
    pageType: PageType.ARTIST,
    query,
    sort,
    order,
  });
};

export const getLibrarySongById = async (
  songId: number,
  pageType: PageType = PageType.LIBRARY,
) => {
  const rows = await db
    .select({
      song: schema.songs,
      artistName: schema.artists.name,
      albumName: schema.albums.name,
      albumCoverImage: schema.albums.coverImage,
    })
    .from(schema.songs)
    .leftJoin(schema.artistSongs, eq(schema.songs.id, schema.artistSongs.songId))
    .leftJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .leftJoin(schema.albumSongs, eq(schema.songs.id, schema.albumSongs.songId))
    .leftJoin(
      schema.albums,
      and(
        eq(schema.albumSongs.albumId, schema.albums.id),
        eq(schema.albumSongs.songId, schema.songs.id),
      ),
    )
    .where(eq(schema.songs.id, songId));

  return rowsToSongs(rows, pageType)[0] ?? null;
};

export const getLibrarySongCoverPath = async (
  songId: number,
  full: boolean = false,
) => {
  const albumRows = await db
    .select({
      coverImage: schema.albums.coverImage,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .where(eq(schema.albumSongs.songId, songId));

  const albumCoverHash = albumRows.find(
    ({ coverImage }) => coverImage,
  )?.coverImage;
  if (albumCoverHash) {
    const paths = getImagePathFromHash(albumCoverHash);
    return full ? paths.pathToFullImage : paths.pathToSmallImage;
  }

  const songRows = await db
    .select({
      coverImage: schema.songs.coverImage,
    })
    .from(schema.songs)
    .where(eq(schema.songs.id, songId));

  const songCoverHash = songRows[0]?.coverImage;
  if (!songCoverHash) {
    return null;
  }

  const paths = getImagePathFromHash(songCoverHash);
  return full ? paths.pathToFullImage : paths.pathToSmallImage;
};

export const deleteLibrarySong = async (songId: number) => {
  await db.delete(schema.albumSongs).where(eq(schema.albumSongs.songId, songId));
  await db
    .delete(schema.artistSongs)
    .where(eq(schema.artistSongs.songId, songId));
  await db
    .delete(schema.playlistSongs)
    .where(eq(schema.playlistSongs.songId, songId));
  await db.delete(schema.songs).where(eq(schema.songs.id, songId));

  try {
    await FileSystem.deleteAsync(
      `${FileSystem.documentDirectory}library/${songId}`,
      { idempotent: true },
    );
  } catch (error) {
    console.log("error deleting library song files: ", error);
  }
};

export const getLibrarySongAlbums = async (songId: number) => {
  const rows = await db
    .select({
      album: schema.albums,
    })
    .from(schema.albumSongs)
    .innerJoin(schema.albums, eq(schema.albumSongs.albumId, schema.albums.id))
    .where(eq(schema.albumSongs.songId, songId));

  return rows.map(({ album }) => {
    const imagePaths = album.coverImage
      ? getImagePathFromHash(album.coverImage)
      : null;

    return {
      id: album.id,
      name: album.name ?? "",
      year: album.year ?? undefined,
      image: imagePaths?.pathToSmallImage,
      fullImage: imagePaths?.pathToFullImage,
      pageType: PageType.EDIT,
    } satisfies AlbumType;
  });
};

export const getLibrarySongArtists = async (songId: number) => {
  const rows = await db
    .select({
      artist: schema.artists,
    })
    .from(schema.artistSongs)
    .innerJoin(schema.artists, eq(schema.artistSongs.artistId, schema.artists.id))
    .where(eq(schema.artistSongs.songId, songId));

  return rows.map(({ artist }) => {
    const imagePaths = artist.profileImage
      ? getImagePathFromHash(artist.profileImage)
      : null;

    return {
      id: artist.id,
      name: artist.name ?? "",
      image: imagePaths?.pathToSmallImage,
      fullImage: imagePaths?.pathToFullImage,
      pageType: PageType.EDIT,
    } satisfies ArtistType;
  });
};

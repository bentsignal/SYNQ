import {
  formatCollectionDetailNames,
  rowsToCollectionDetailSongs,
  type LibraryCollectionDetailSong,
  type LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";

export {
  rowsToCollectionDetailSongs,
  type LibraryCollectionDetailSong,
  type LibraryCollectionDetailSongRow,
} from "./library-collection-detail-song-service";
export type { LibraryCollectionDetailKind } from "./library-collection-kind-service";

export type LibraryCollectionDetail = {
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

export type PlaylistDetailRow = {
  coverImage: string | null;
  name: string | null;
};

export type AlbumDetailRow = {
  artistName: string | null;
  coverImage: string | null;
  name: string | null;
  year: number | null;
};

export type ArtistDetailRow = {
  albumId: number | null;
  name: string | null;
  profileImage: string | null;
};

export type CollectionImagePathResolver = (imageHash: string) => string | null;

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

export const buildPlaylistDetail = ({
  getImagePath,
  playlistRows,
  songRows,
  updatedAt,
}: {
  getImagePath?: CollectionImagePathResolver;
  playlistRows: PlaylistDetailRow[];
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const songs = rowsToCollectionDetailSongs(songRows);
  const playlist = playlistRows[0];

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Playlist",
    imagePath: playlist?.coverImage
      ? getImagePath?.(playlist.coverImage) ?? null
      : null,
    isMissing: !playlist,
    kind: "playlist",
    meta: "Manual collection",
    songs,
    title: playlist?.name ?? "Playlist not found",
    updatedAt,
  };
};

export const buildAlbumDetail = ({
  albumRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  albumRows: AlbumDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const artists = new Set<string>();
  albumRows.forEach((row) => {
    if (row.artistName) {
      artists.add(row.artistName);
    }
  });

  const album = albumRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);
  const artistLabel = formatCollectionDetailNames(artists);

  return {
    detail: formatCount(songs.length, "song"),
    eyebrow: "Album",
    imagePath: album?.coverImage
      ? getImagePath?.(album.coverImage) ?? null
      : null,
    isMissing: !album,
    kind: "album",
    meta: album?.year ? `${artistLabel} / ${album.year}` : artistLabel,
    songs,
    title: album?.name ?? "Album not found",
    updatedAt,
  };
};

export const buildArtistDetail = ({
  artistRows,
  getImagePath,
  songRows,
  updatedAt,
}: {
  artistRows: ArtistDetailRow[];
  getImagePath?: CollectionImagePathResolver;
  songRows: LibraryCollectionDetailSongRow[];
  updatedAt: number;
}): LibraryCollectionDetail => {
  const albumIds = new Set<number>();
  artistRows.forEach((row) => {
    if (row.albumId) {
      albumIds.add(row.albumId);
    }
  });

  const artist = artistRows[0];
  const songs = rowsToCollectionDetailSongs(songRows);

  return {
    detail: `${formatCount(songs.length, "song")} / ${formatCount(
      albumIds.size,
      "album",
    )}`,
    eyebrow: "Artist",
    imagePath: artist?.profileImage
      ? getImagePath?.(artist.profileImage) ?? null
      : null,
    isMissing: !artist,
    kind: "artist",
    meta: "Library artist",
    songs,
    title: artist?.name ?? "Artist not found",
    updatedAt,
  };
};

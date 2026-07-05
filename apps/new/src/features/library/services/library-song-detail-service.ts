import { formatDurationMs } from "../../app-shell/services/duration-format-service";
import {
  formatLibrarySongDetailCount,
  formatLibrarySongDetailNames,
  uniqueLibrarySongDetailRowsById,
} from "./library-song-detail-format-service";
import { likedSongsPlaylistId } from "./library-playlist-constants-service";
import type {
  LibrarySongDetail,
  LibrarySongDetailAlbumRow,
  LibrarySongDetailArtistRow,
  LibrarySongDetailLikedRow,
  LibrarySongDetailPlaylistRow,
  LibrarySongDetailSongRow,
} from "./library-song-detail-types-service";

export const buildLibrarySongDetail = ({
  albumRows,
  artistRows,
  getImagePath,
  likedRows,
  playlistRows,
  songRow,
  updatedAt,
}: {
  albumRows: LibrarySongDetailAlbumRow[];
  artistRows: LibrarySongDetailArtistRow[];
  getImagePath?: (imageHash: string) => string;
  likedRows: LibrarySongDetailLikedRow[];
  playlistRows: LibrarySongDetailPlaylistRow[];
  songRow: LibrarySongDetailSongRow | null;
  updatedAt: number;
}): LibrarySongDetail => {
  const uniqueArtists = uniqueLibrarySongDetailRowsById(artistRows);
  const uniqueAlbums = uniqueLibrarySongDetailRowsById(albumRows);
  const uniquePlaylists = uniqueLibrarySongDetailRowsById(playlistRows);
  const artistLabel = formatLibrarySongDetailNames(
    uniqueArtists.flatMap((artist) => (artist.name ? [artist.name] : [])),
  );
  const albumLabel = formatLibrarySongDetailNames(
    uniqueAlbums.flatMap((album) => (album.name ? [album.name] : [])),
  );
  const coverImageHash =
    songRow?.coverImage ??
    uniqueAlbums.find((album) => album.coverImage !== null)?.coverImage ??
    null;

  return {
    albumLabel,
    albums: uniqueAlbums.map((album) => ({
      detail: album.year ? album.year.toString() : "Album",
      id: album.id,
      title: album.name ?? "Untitled album",
      track: album.track,
    })),
    artistLabel,
    artists: uniqueArtists.map((artist) => ({
      id: artist.id,
      title: artist.name ?? "Untitled artist",
    })),
    coverImagePath: coverImageHash ? getImagePath?.(coverImageHash) ?? null : null,
    duration: songRow?.duration ?? null,
    durationLabel: formatDurationMs(songRow?.duration ?? null),
    fileType: songRow?.fileType ?? "Unknown file type",
    isLiked:
      likedRows.length > 0 ||
      uniquePlaylists.some((playlist) => playlist.id === likedSongsPlaylistId),
    isMissing: !songRow,
    originalFileName: songRow?.originalFileName ?? "Unknown source file",
    pathToFile: songRow?.pathToFile ?? null,
    playlists: uniquePlaylists.map((playlist) => ({
      id: playlist.id,
      title: playlist.name ?? "Untitled playlist",
    })),
    relationshipSummary: [
      formatLibrarySongDetailCount(uniqueArtists.length, "artist"),
      formatLibrarySongDetailCount(uniqueAlbums.length, "album"),
      formatLibrarySongDetailCount(uniquePlaylists.length, "playlist"),
    ].join(" / "),
    title: songRow?.title ?? "Song not found",
    updatedAt,
  };
};

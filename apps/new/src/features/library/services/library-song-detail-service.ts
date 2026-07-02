import { formatDurationMs } from "../../app-shell/services/duration-format-service";
import { likedSongsPlaylistId } from "./library-playlist-constants-service";

export type LibrarySongDetailSongRow = {
  duration: number | null;
  fileType: string | null;
  originalFileName: string | null;
  pathToFile: string | null;
  title: string | null;
};

export type LibrarySongDetailAlbumRow = {
  id: number;
  name: string | null;
  track: number | null;
  year: number | null;
};

export type LibrarySongDetailArtistRow = {
  id: number;
  name: string | null;
};

export type LibrarySongDetailPlaylistRow = {
  id: number;
  name: string | null;
};

export type LibrarySongDetailLikedRow = {
  id: number;
};

export type LibrarySongDetail = {
  albumLabel: string;
  albums: {
    detail: string;
    id: number;
    title: string;
    track: number | null;
  }[];
  artistLabel: string;
  artists: {
    id: number;
    title: string;
  }[];
  duration: number | null;
  durationLabel: string;
  fileType: string;
  isLiked: boolean;
  isMissing: boolean;
  originalFileName: string;
  pathToFile: string | null;
  playlists: {
    id: number;
    title: string;
  }[];
  relationshipSummary: string;
  title: string;
  updatedAt: number;
};

export type LibrarySongRelationshipKind = "album" | "artist" | "playlist";

export type LibrarySongRelationshipHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

const formatCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

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

export const buildLibrarySongDetail = ({
  albumRows,
  artistRows,
  likedRows,
  playlistRows,
  songRow,
  updatedAt,
}: {
  albumRows: LibrarySongDetailAlbumRow[];
  artistRows: LibrarySongDetailArtistRow[];
  likedRows: LibrarySongDetailLikedRow[];
  playlistRows: LibrarySongDetailPlaylistRow[];
  songRow: LibrarySongDetailSongRow | null;
  updatedAt: number;
}): LibrarySongDetail => {
  const uniqueArtists = uniqueById(artistRows);
  const uniqueAlbums = uniqueById(albumRows);
  const uniquePlaylists = uniqueById(playlistRows);
  const artistLabel = formatNames(
    uniqueArtists.flatMap((artist) => (artist.name ? [artist.name] : [])),
  );
  const albumLabel = formatNames(
    uniqueAlbums.flatMap((album) => (album.name ? [album.name] : [])),
  );

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
      formatCount(uniqueArtists.length, "artist"),
      formatCount(uniqueAlbums.length, "album"),
      formatCount(uniquePlaylists.length, "playlist"),
    ].join(" / "),
    title: songRow?.title ?? "Song not found",
    updatedAt,
  };
};

export const getLibrarySongRelationshipHref = ({
  id,
  kind,
}: {
  id: number;
  kind: LibrarySongRelationshipKind;
}): LibrarySongRelationshipHref => {
  switch (kind) {
    case "album":
      return `/(tabs)/library/album/${id}`;
    case "artist":
      return `/(tabs)/library/artist/${id}`;
    case "playlist":
    default:
      return `/(tabs)/library/playlist/${id}`;
  }
};

export const getLibrarySongDetailActionState = ({
  detail,
  isDeleting,
  isExporting,
  isTogglingLiked,
}: {
  detail: LibrarySongDetail;
  isDeleting: boolean;
  isExporting: boolean;
  isTogglingLiked: boolean;
}) => {
  const canPlay = !detail.isMissing && detail.pathToFile !== null;

  return {
    canDelete: !detail.isMissing && !isDeleting,
    canExport: canPlay && !isExporting,
    canPlay,
    canToggleLiked: !detail.isMissing && !isTogglingLiked,
    deleteLabel: isDeleting ? "Deleting" : "Delete",
    exportLabel: isExporting ? "Exporting" : "Export",
    likedLabel: detail.isLiked ? "Unlike" : "Like",
  };
};

export type LibrarySongDetailActionState = ReturnType<
  typeof getLibrarySongDetailActionState
>;

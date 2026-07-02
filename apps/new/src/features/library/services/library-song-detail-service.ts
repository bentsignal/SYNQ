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

export type LibrarySongDetailHref =
  | "/player"
  | "/(tabs)/library"
  | `/(tabs)/library/song/${number}`
  | `/(tabs)/library/song/edit/${number}`;

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

export const getLibrarySongDetailPlayerHref = (): LibrarySongDetailHref =>
  "/player";

export const getLibrarySongDetailBackHref = (): LibrarySongDetailHref =>
  "/(tabs)/library";

export const getLibraryInvalidSongState = () => ({
  backLink: {
    href: getLibrarySongDetailBackHref(),
    label: "Back to Library",
  },
  body: "This route needs a numeric id.",
  kicker: "Song",
  title: "Invalid song",
});

export const getLibrarySongDetailViewState = (
  detail: LibrarySongDetail,
) => ({
  backLink: {
    href: getLibrarySongDetailBackHref(),
    label: "Back to Library",
  },
  relationshipSections: {
    albums: {
      emptyLabel: "No albums linked",
      items: detail.albums.map((album) => ({
        detail:
          album.track !== null
            ? `${album.detail} / track ${album.track}`
            : album.detail,
        id: album.id,
        title: album.title,
      })),
      kind: "album" as const,
      title: "Albums",
    },
    artists: {
      emptyLabel: "No artists linked",
      items: detail.artists,
      kind: "artist" as const,
      title: "Artists",
    },
    playlists: {
      emptyLabel: "No playlists linked",
      items: detail.playlists,
      kind: "playlist" as const,
      title: "Playlists",
    },
  },
});

export const getLibrarySongDetailHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref => `/(tabs)/library/song/${songId}`;

export const getLibrarySongEditHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref => `/(tabs)/library/song/edit/${songId}`;

export const getLibrarySongDeleteSuccessHref = (): LibrarySongDetailHref =>
  getLibrarySongDetailBackHref();

export const getLibrarySongDeleteConfirmationCopy = (
  detail: LibrarySongDetail,
) => ({
  body: `Delete ${detail.title}?`,
  cancelLabel: "Cancel",
  confirmLabel: "Delete",
  title: "Delete song",
});

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

export type LibrarySongDetailMutationState = {
  error: string | null;
  isDeleting: boolean;
  isExporting: boolean;
  isTogglingLiked: boolean;
};

export type LibrarySongDetailMutationAction =
  | {
      mutation: LibrarySongDetailMutationKind;
      type: "begin";
    }
  | {
      mutation: LibrarySongDetailMutationKind;
      type: "finish";
    }
  | {
      error: string;
      type: "fail";
    };

export const initialLibrarySongDetailMutationState: LibrarySongDetailMutationState =
  {
    error: null,
    isDeleting: false,
    isExporting: false,
    isTogglingLiked: false,
  };

const getMutationFlag = (mutation: LibrarySongDetailMutationKind) => {
  switch (mutation) {
    case "delete-song":
      return "isDeleting";
    case "export-song":
      return "isExporting";
    case "toggle-liked":
      return "isTogglingLiked";
  }
};

export const librarySongDetailMutationReducer = (
  state: LibrarySongDetailMutationState,
  action: LibrarySongDetailMutationAction,
): LibrarySongDetailMutationState => {
  switch (action.type) {
    case "begin":
      return {
        ...state,
        [getMutationFlag(action.mutation)]: true,
        error: null,
      };
    case "finish":
      return {
        ...state,
        [getMutationFlag(action.mutation)]: false,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
      };
  }
};

export type LibrarySongDetailStatusState = {
  isError: boolean;
  statusLabel: string;
  updatedLabel: string;
};

export const getLibrarySongDetailStatusState = ({
  actionState,
  detail,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  mutationError,
}: {
  actionState: LibrarySongDetailActionState;
  detail: LibrarySongDetail;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  mutationError: string | null;
}): LibrarySongDetailStatusState => {
  const updatedLabel =
    detail.updatedAt > 0
      ? `Updated ${formatUpdatedAt(detail.updatedAt)}`
      : "Waiting for song data";

  if (mutationError !== null) {
    return {
      isError: true,
      statusLabel: mutationError,
      updatedLabel,
    };
  }

  if (errors.length > 0) {
    return {
      isError: true,
      statusLabel: "One or more song detail queries failed.",
      updatedLabel,
    };
  }

  if (detail.isMissing) {
    return {
      isError: false,
      statusLabel: "Song missing from database.",
      updatedLabel,
    };
  }

  if (!actionState.canPlay) {
    return {
      isError: false,
      statusLabel: "Song has no playable file path.",
      updatedLabel,
    };
  }

  return {
    isError: false,
    statusLabel: updatedLabel,
    updatedLabel,
  };
};

export type LibrarySongDetailMutationKind =
  | "delete-song"
  | "export-song"
  | "toggle-liked";

export const getLibrarySongDetailMutationErrorMessage = ({
  caughtError,
  mutation,
}: {
  caughtError: unknown;
  mutation: LibrarySongDetailMutationKind;
}) => {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  switch (mutation) {
    case "delete-song":
      return "Song could not be deleted.";
    case "export-song":
      return "Song could not be exported.";
    case "toggle-liked":
      return "Liked Songs could not be updated.";
  }
};

export const toLibrarySongDetailPlaybackItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  album: detail.albumLabel,
  artist: detail.artistLabel,
  duration: detail.duration,
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongDetailPlaybackItem = ReturnType<
  typeof toLibrarySongDetailPlaybackItem
>;

export const toLibrarySongExportItem = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  id: songId,
  pathToFile: detail.pathToFile,
  title: detail.title,
});

export type LibrarySongExportItem = ReturnType<typeof toLibrarySongExportItem>;

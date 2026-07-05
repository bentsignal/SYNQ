import type {
  LibrarySongPreview,
  LibrarySongPreviewOrder,
  LibrarySongPreviewSort,
} from "./library-song-preview-service";
import type { HapticFeedbackType } from "../../settings/services/haptic-feedback-service";

export type LibrarySongPreviewPlaybackItem = {
  album: string;
  artist: string;
  duration: number | null;
  id: number;
  pathToFile: string | null;
  title: string;
};

export type LibrarySongPreviewHref =
  | "/(tabs)/import"
  | "/player"
  | `/(tabs)/library/song/${number}`;

export const getLibrarySongPreviewRowState = ({
  activeTrackId,
  song,
}: {
  activeTrackId: number | null;
  song: LibrarySongPreview;
}) => ({
  canPlay: song.pathToFile !== null,
  isActive: activeTrackId === song.id,
});

export const getLibrarySongPreviewDetailHref = (
  song: LibrarySongPreview,
): LibrarySongPreviewHref => `/(tabs)/library/song/${song.id}`;

export const getLibrarySongPreviewPlayerHref = (): LibrarySongPreviewHref =>
  "/player";

type LibrarySongPreviewPlaybackCommand = {
  haptic: HapticFeedbackType;
};

type LibrarySongPreviewPlayCommand = LibrarySongPreviewPlaybackCommand & {
  href: LibrarySongPreviewHref;
};

export const getLibrarySongPreviewPlayCommand =
  (): LibrarySongPreviewPlayCommand => ({
    haptic: "light",
    href: getLibrarySongPreviewPlayerHref(),
  });

export const getLibrarySongPreviewQueueCommand =
  (): LibrarySongPreviewPlaybackCommand => ({
    haptic: "light",
  });

export const getLibrarySongPreviewEmptyState = () => ({
  body: "Import audio files to start building your song library.",
  link: {
    href: "/(tabs)/import" as LibrarySongPreviewHref,
    label: "Import music",
  },
  title: "No songs yet",
});

export const getLibrarySongPreviewListState = ({
  activeTrackId,
  songs,
}: {
  activeTrackId: number | null;
  songs: LibrarySongPreview[];
}) => ({
  emptyState: getLibrarySongPreviewEmptyState(),
  meta: `${songs.length} shown`,
  rows: songs.map((song) => ({
    detailHref: getLibrarySongPreviewDetailHref(song),
    rowState: getLibrarySongPreviewRowState({ activeTrackId, song }),
    song,
  })),
  title: "Recent Songs",
});

export type LibrarySongPreviewRowViewState = ReturnType<
  typeof getLibrarySongPreviewListState
>["rows"][number];

export const getLibrarySongListControlsState = ({
  order,
  sort,
}: {
  order: LibrarySongPreviewOrder;
  sort: LibrarySongPreviewSort;
}) => ({
  orderButton: {
    haptic: "light" as HapticFeedbackType,
    label: order === "asc" ? "Asc" : "Desc",
    nextOrder: order === "asc" ? "desc" as const : "asc" as const,
  },
  searchInput: {
    placeholder: "Search songs, artists, albums",
  },
  sortOptions: [
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "recent",
      label: "Recent",
      value: "recent" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "title",
      label: "Title",
      value: "title" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "artist",
      label: "Artist",
      value: "artist" as const,
    },
    {
      haptic: "light" as HapticFeedbackType,
      isActive: sort === "album",
      label: "Album",
      value: "album" as const,
    },
  ],
});

export const toLibrarySongPlaybackItem = (
  song: LibrarySongPreview,
): LibrarySongPreviewPlaybackItem => ({
  album: song.album,
  artist: song.artist,
  duration: song.duration,
  id: song.id,
  pathToFile: song.pathToFile,
  title: song.title,
});

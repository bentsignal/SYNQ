import type { LibrarySongDetail } from "./library-song-detail-service";

export type LibrarySongRelationshipKind = "album" | "artist" | "playlist";

export type LibrarySongRelationshipHref =
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export type LibrarySongDetailHref =
  | "/player"
  | "/(tabs)/library"
  | `/(tabs)/library/song/add-to-playlist/${number}`
  | `/(tabs)/library/song/${number}`
  | `/(tabs)/library/song/edit/${number}`;

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

export const getLibrarySongDetailViewState = ({
  detail,
  songId,
}: {
  detail: LibrarySongDetail;
  songId: number;
}) => ({
  actionLinks: {
    addToPlaylistHref: getLibrarySongAddToPlaylistHref({ songId }),
    editHref: getLibrarySongEditHref({ songId }),
  },
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
        href: getLibrarySongRelationshipHref({ id: album.id, kind: "album" }),
        id: album.id,
        title: album.title,
      })),
      kind: "album" as const,
      title: "Albums",
    },
    artists: {
      emptyLabel: "No artists linked",
      items: detail.artists.map((artist) => ({
        ...artist,
        href: getLibrarySongRelationshipHref({ id: artist.id, kind: "artist" }),
      })),
      kind: "artist" as const,
      title: "Artists",
    },
    playlists: {
      emptyLabel: "No playlists linked",
      items: detail.playlists.map((playlist) => ({
        ...playlist,
        href: getLibrarySongRelationshipHref({
          id: playlist.id,
          kind: "playlist",
        }),
      })),
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

export const getLibrarySongAddToPlaylistHref = ({
  songId,
}: {
  songId: number;
}): LibrarySongDetailHref => `/(tabs)/library/song/add-to-playlist/${songId}`;

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

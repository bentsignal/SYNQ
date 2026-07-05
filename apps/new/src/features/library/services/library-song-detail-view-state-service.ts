import type { LibrarySongDetail } from "./library-song-detail-service";
import {
  getLibrarySongAddToPlaylistHref,
  getLibrarySongDetailBackHref,
  getLibrarySongEditHref,
  getLibrarySongRelationshipHref,
} from "./library-song-navigation-service";

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

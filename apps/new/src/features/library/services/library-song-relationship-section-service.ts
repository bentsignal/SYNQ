import type { LibrarySongDetail } from "./library-song-detail-types-service";
import { getLibrarySongRelationshipHref } from "./library-song-navigation-service";

export const getLibrarySongRelationshipSections = (
  detail: Pick<LibrarySongDetail, "albums" | "artists" | "playlists">,
) => ({
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
});

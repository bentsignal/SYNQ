import {
  getLibrarySongDetailHref,
  type LibrarySongDetailHref,
} from "./library-song-interaction-service";

export const getSongAddToPlaylistBackLink = ({
  songId,
}: {
  songId: number;
}): { href: LibrarySongDetailHref; label: string } => ({
  href: getLibrarySongDetailHref({ songId }),
  label: "Song details",
});

export const getSongAddToPlaylistCopy = () => ({
  emptyLabel: "No playlists available",
  kicker: "Library",
  placeholder: "Search playlists",
  title: "Add to playlist",
});

export const getSongAddToPlaylistHeaderState = ({
  songId,
}: {
  songId: number;
}) => ({
  backLink: getSongAddToPlaylistBackLink({ songId }),
  copy: getSongAddToPlaylistCopy(),
});

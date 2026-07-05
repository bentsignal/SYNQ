import type { LibraryCollectionDetailSong } from "./library-collection-detail-service";
import type { LibraryCollectionDetailKind } from "./library-collection-kind-service";
import {
  getCollectionAddSongsHref,
  getCollectionEditHref,
  getLibraryCollectionBackHref,
} from "./library-collection-navigation-service";

export const getLibraryCollectionSongEmptyState = () => ({
  body: "Add songs from your library to build this collection.",
  title: "No songs here yet",
});

export const getCollectionDetailViewState = ({
  id,
  kind,
  songs,
}: {
  id: number;
  kind: LibraryCollectionDetailKind;
  songs: LibraryCollectionDetailSong[];
}) => ({
  actionLinks: {
    addHref: getCollectionAddSongsHref({ id, kind }),
    editHref: getCollectionEditHref({ id, kind }),
  },
  backLink: {
    href: getLibraryCollectionBackHref(),
    label: "Back to Library",
  },
  songSection: {
    emptyState: getLibraryCollectionSongEmptyState(),
    meta: `${songs.length} songs`,
    title: "Songs",
  },
});

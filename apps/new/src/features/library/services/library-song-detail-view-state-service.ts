import type { LibrarySongDetail } from "./library-song-detail-types-service";
import {
  getLibrarySongAddToPlaylistHref,
  getLibrarySongDetailBackHref,
  getLibrarySongEditHref,
} from "./library-song-navigation-service";
import { getLibrarySongRelationshipSections } from "./library-song-relationship-section-service";

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
  relationshipSections: getLibrarySongRelationshipSections(detail),
});

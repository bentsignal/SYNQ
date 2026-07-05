import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import { LibrarySongRelationshipSection } from "./LibrarySongRelationshipSection";

type LibrarySongRelationshipSectionsState = ReturnType<
  typeof getLibrarySongDetailViewState
>["relationshipSections"];

type LibrarySongRelationshipSectionsProps = {
  sections: LibrarySongRelationshipSectionsState;
};

export function LibrarySongRelationshipSections({
  sections,
}: LibrarySongRelationshipSectionsProps) {
  return (
    <>
      <LibrarySongRelationshipSection
        emptyLabel={sections.artists.emptyLabel}
        items={sections.artists.items}
        title={sections.artists.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={sections.albums.emptyLabel}
        items={sections.albums.items}
        title={sections.albums.title}
      />
      <LibrarySongRelationshipSection
        emptyLabel={sections.playlists.emptyLabel}
        items={sections.playlists.items}
        title={sections.playlists.title}
      />
    </>
  );
}

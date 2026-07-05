import type { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import { LibrarySongDetailActionLink } from "./LibrarySongDetailActionButton";

type LibraryTheme = ReturnType<typeof useCustomizationTheme>;

type LibrarySongDetailNavigationActionsProps = {
  actionLinks: ReturnType<typeof getLibrarySongDetailViewState>["actionLinks"];
  theme: LibraryTheme;
};

export function LibrarySongDetailNavigationActions({
  actionLinks,
  theme,
}: LibrarySongDetailNavigationActionsProps) {
  return (
    <>
      <LibrarySongDetailActionLink
        href={actionLinks.addToPlaylistHref}
        label="Add to playlist"
        minWidth={164}
        theme={theme}
      />
      <LibrarySongDetailActionLink
        href={actionLinks.editHref}
        label="Edit"
        minWidth={132}
        theme={theme}
      />
    </>
  );
}

import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";
import { LibraryBackLink } from "./LibraryBackLink";

type LibrarySongDetailBackLinkState = ReturnType<
  typeof getLibrarySongDetailViewState
>["backLink"];

type LibrarySongDetailBackLinkProps = {
  backLink: LibrarySongDetailBackLinkState;
};

export function LibrarySongDetailBackLink({
  backLink,
}: LibrarySongDetailBackLinkProps) {
  const theme = useCustomizationTheme();

  return <LibraryBackLink backLink={backLink} theme={theme} />;
}

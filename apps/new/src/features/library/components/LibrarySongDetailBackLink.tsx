import { Link } from "expo-router";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { getLibrarySongDetailViewState } from "../services/library-song-detail-view-state-service";

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

  return (
    <Link
      className="text-[15px] font-extrabold"
      href={backLink.href}
      style={{ color: theme.accent }}
    >
      {backLink.label}
    </Link>
  );
}
